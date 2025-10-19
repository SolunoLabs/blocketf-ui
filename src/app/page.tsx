'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { maxUint256 } from 'viem';
import { ETFOverview } from '@/components/ETFOverview';
import { MyHoldings } from '@/components/MyHoldings';
import { TradePanel } from '@/components/TradePanel';
import { TransactionModal } from '@/components/TransactionModal';
import { useBlockETFData } from '@/hooks/useBlockETF';
import { erc20ABI, etfRouterABI, blockETFCoreABI } from '@/lib/contracts/abis';
import { getContractAddress } from '@/lib/contracts/addresses';

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { assets, totalValue, totalSupply, shareValue, isPaused, etfName, etfSymbol } = useBlockETFData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get contract addresses
  const etfCoreAddress = getContractAddress(chainId as 56 | 97, 'blockETFCore');

  // Read fee information
  const { data: feeInfoData } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'getFeeInfo',
  });


  const [txStatus, setTxStatus] = useState<string>('');
  const [showTxModal, setShowTxModal] = useState<boolean>(false);
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync } = useWriteContract();

  // Wait for transaction confirmation
  const {
    isSuccess: isTxConfirmed,
    isError: isTxFailed,
    error: txError
  } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  });

  // Refresh data when transaction is confirmed
  useEffect(() => {
    if (isTxConfirmed && lastTxHash) {
      setTxStatus('Transaction confirmed! Refreshing data...');

      // Invalidate all queries to force refetch
      setTimeout(() => {
        queryClient.invalidateQueries();
        setTxStatus('All data updated successfully! 🎉');
        // Don't auto-close, let user close manually
      }, 1500);
    }
  }, [isTxConfirmed, lastTxHash, queryClient]);

  // Handle transaction failure
  useEffect(() => {
    if (isTxFailed && lastTxHash) {
      console.error('[Transaction] Failed:', lastTxHash, txError);
      const errorMsg = txError instanceof Error ? txError.message : 'Transaction failed';
      setTxStatus(`❌ Transaction failed: ${errorMsg}`);
    }
  }, [isTxFailed, lastTxHash, txError]);

  const routerAddress = getContractAddress(chainId as 56 | 97, 'etfRouter');
  const usdtAddress = getContractAddress(chainId as 56 | 97, 'usdt');

  // Prefetch balance data for TradePanel to avoid loading delay when scrolling
  // These queries will be cached and reused by TradePanel and MyHoldings components
  // Using aggressive caching to improve mobile performance
  useReadContract({
    address: usdtAddress,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 60_000, // 1 minute - increased for better performance
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Disable refetch on focus for mobile
      refetchOnMount: false, // Use cached data if available
    },
  });

  useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 60_000, // 1 minute - increased for better performance
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Disable refetch on focus for mobile
      refetchOnMount: false, // Use cached data if available
    },
  });

  // Helper function to check and approve if needed (with unlimited approval)
  const ensureApproval = async (
    tokenAddress: `0x${string}`,
    spenderAddress: `0x${string}`,
    requiredAmount: bigint,
    tokenName: string
  ) => {
    if (!address) return false;

    try {
      setTxStatus(`Checking ${tokenName} allowance...`);

      // Import viem utilities once
      const { readContract, waitForTransactionReceipt } = await import('viem/actions');
      const { createPublicClient, http } = await import('viem');
      const { bsc, bscTestnet } = await import('viem/chains');

      // Select the correct chain and RPC URL
      const chain = chainId === 56 ? bsc : bscTestnet;
      const rpcUrl = chainId === 56
        ? 'https://bsc-dataseed.binance.org'
        : 'https://data-seed-prebsc-1-s1.binance.org:8545';

      const publicClient = createPublicClient({
        chain,
        transport: http(rpcUrl),
      });

      // Check current allowance
      const currentAllowance = await readContract(publicClient, {
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address, spenderAddress],
      }) as bigint;

      // If allowance is sufficient, skip approval
      if (currentAllowance >= requiredAmount) {
        setTxStatus(`${tokenName} already approved, proceeding...`);
        return true;
      }

      // Need to approve
      setTxStatus(`Approving ${tokenName} (one-time unlimited approval)...`);

      const approveTx = await writeContractAsync({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'approve',
        args: [spenderAddress, maxUint256], // Unlimited approval
      });

      setTxStatus('Approval submitted, waiting for confirmation...');

      // Wait for approval transaction to be mined
      const receipt = await waitForTransactionReceipt(publicClient, {
        hash: approveTx,
        confirmations: 2, // Wait for 2 confirmations
      });

      if (receipt.status === 'reverted') {
        throw new Error('Approval transaction reverted');
      }

      setTxStatus(`${tokenName} approved successfully!`);

      return true;
    } catch (error) {
      console.error('[Approval] Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setTxStatus(`Approval failed: ${errorMessage}`);
      throw error;
    }
  };

  const handleInvest = async (shares: bigint, maxUSDT: bigint) => {
    if (!address) return;

    try {
      setShowTxModal(true);

      // 1. Check and approve USDT if needed (unlimited approval for better UX)
      await ensureApproval(usdtAddress, routerAddress, maxUSDT, 'USDT');

      setTxStatus('Minting ETF shares...');

      // 2. Call router.mintExactShares
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600); // 10 minutes

      const mintTx = await writeContractAsync({
        address: routerAddress,
        abi: etfRouterABI,
        functionName: 'mintExactShares',
        args: [shares, maxUSDT, deadline],
        gas: BigInt(1500000),
      });

      setTxStatus('Waiting for transaction confirmation...');
      setLastTxHash(mintTx);
    } catch (error) {
      console.error('Invest error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      setTxStatus(`Error: ${errorMessage}`);
      // Don't auto-close, let user close manually
    }
  };

  const handleRedeem = async (shares: bigint, minUSDT: bigint) => {
    if (!address) return;

    try {
      setShowTxModal(true);

      // 1. Check and approve ETF shares if needed (unlimited approval for better UX)
      await ensureApproval(etfCoreAddress, routerAddress, shares, 'ETF shares');

      setTxStatus('Burning ETF shares...');

      // 2. Call router.burnToUSDT
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600); // 10 minutes

      const burnTx = await writeContractAsync({
        address: routerAddress,
        abi: etfRouterABI,
        functionName: 'burnToUSDT',
        args: [shares, minUSDT, deadline],
        gas: BigInt(1500000),
      });

      setTxStatus('Waiting for transaction confirmation...');
      setLastTxHash(burnTx);
    } catch (error) {
      console.error('Redeem error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      setTxStatus(`Error: ${errorMessage}`);
      // Don't auto-close, let user close manually
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTxModal}
        status={txStatus}
        txHash={lastTxHash}
        chainId={chainId}
        onClose={() => {
          setShowTxModal(false);
          setTxStatus('');
          setLastTxHash(undefined);
        }}
      />

      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Logo + Desktop Navigation */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <span className="text-white font-bold text-lg sm:text-xl">B</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  BlockETF
                </h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden sm:flex space-x-6">
                <Link
                  href="/"
                  className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-gray-300 font-medium transition-colors"
                >
                  About
                </Link>
                {chainId === 97 && (
                  <Link
                    href="/faucet"
                    className="text-gray-400 hover:text-gray-300 font-medium transition-colors"
                  >
                    Faucet 💧
                  </Link>
                )}
              </nav>
            </div>

            {/* Right side: Connect Button (Desktop) / Network + Wallet + Menu (Mobile) */}
            <div className="flex items-center gap-2">
              {/* Desktop Connect Button */}
              <div className="hidden sm:block">
                <ConnectButton />
              </div>

              {/* Mobile Network + Wallet Icons */}
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;

                  return (
                    <div className="sm:hidden flex items-center gap-1">
                      {/* Network Button - only show when connected */}
                      {connected && chain && (
                        <button
                          onClick={openChainModal}
                          className="px-2 py-1 text-xs font-medium text-gray-300 hover:text-gray-100 bg-gray-800/50 hover:bg-gray-700/50 rounded-md transition-colors border border-gray-700/50"
                          aria-label="Switch Network"
                        >
                          {chain.name === 'BNB Smart Chain' ? 'BSC' :
                           chain.name === 'BNB Smart Chain Testnet' ? 'BSC Test' :
                           chain.name}
                        </button>
                      )}

                      {/* Wallet Button */}
                      <button
                        onClick={connected ? openAccountModal : openConnectModal}
                        className="p-2 text-gray-400 hover:text-gray-300 transition-colors relative"
                        aria-label="Wallet"
                      >
                        {connected && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                }}
              </ConnectButton.Custom>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 text-gray-400 hover:text-gray-300 transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="sm:hidden fixed top-[73px] right-4 z-50 animate-in slide-in-from-right duration-200">
            <div className="bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-700/70 shadow-2xl p-3 w-auto">
              <nav className="flex flex-col space-y-2.5 items-end whitespace-nowrap">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-blue-400 font-medium hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-700/50 text-right"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-gray-300 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-700/50 text-right"
                >
                  About
                </Link>
                {chainId === 97 && (
                  <Link
                    href="/faucet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-400 hover:text-gray-300 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-700/50 text-right"
                  >
                    Faucet 💧
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPaused && (
          <div className="mb-6 bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-yellow-400 font-medium">
              ⚠️ Trading is currently paused
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - ETF Overview */}
          <div className="lg:col-span-2">
            <ETFOverview
              sharePrice={shareValue}
              totalValue={totalValue}
              totalSupply={totalSupply}
              assets={assets}
              etfName={etfName}
              etfSymbol={etfSymbol}
              feeInfo={(() => {
                if (!feeInfoData) return undefined;
                const data = feeInfoData as unknown as Record<string, unknown>;
                return {
                  withdrawFee: (data.withdrawFee ?? data[0]) as number,
                  managementFeeRate: (data.managementFeeRate ?? data[1]) as bigint,
                  accumulatedFee: (data.accumulatedFee ?? data[2]) as bigint,
                  lastCollectTime: (data.lastCollectTime ?? data[3]) as bigint,
                };
              })()}
            />
          </div>

          {/* Right Column - Holdings & Trade */}
          <div className="space-y-6">
            <MyHoldings isConnected={isConnected} />

            <TradePanel
              isConnected={isConnected}
              onInvest={handleInvest}
              onRedeem={handleRedeem}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm space-y-2">
          <p className="text-gray-400">
            BlockETF - Decentralized ETF Platform | Built on BSC
          </p>
          <p className="text-xs text-gray-600">
            © 2025 Keegan Soluno Lab. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
