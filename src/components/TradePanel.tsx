'use client';

import { useState, useMemo } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useReadContract, useChainId, useAccount } from 'wagmi';
import { etfRouterABI, erc20ABI, blockETFCoreABI } from '@/lib/contracts/abis';
import { getContractAddress } from '@/lib/contracts/addresses';

type TradeMode = 'invest' | 'redeem';

interface TradePanelProps {
  isConnected: boolean;
  onInvest?: (shares: bigint, maxUSDT: bigint) => void;
  onRedeem?: (shares: bigint, minUSDT: bigint) => void;
  isLoading?: boolean;
}

export function TradePanel({
  isConnected,
  onInvest,
  onRedeem,
  isLoading = false,
}: TradePanelProps) {
  const chainId = useChainId();
  const { address } = useAccount();
  const routerAddress = getContractAddress(chainId as 56 | 97, 'etfRouter');
  const usdtAddress = getContractAddress(chainId as 56 | 97, 'usdt');
  const etfCoreAddress = getContractAddress(chainId as 56 | 97, 'blockETFCore');

  const [mode, setMode] = useState<TradeMode>('invest');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState<number>(3); // Default 3%
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);

  // Query USDT balance - always enabled for better UX (no loading when switching modes)
  // Using queryKey to share cache with other components
  const { data: usdtBalance, isLoading: isLoadingUsdtBalance } = useReadContract({
    address: usdtAddress,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 30_000, // Consider data fresh for 30 seconds (increased from 10s)
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    },
  });

  // Query ETF shares balance - always enabled for better UX
  const { data: etfBalance, isLoading: isLoadingEtfBalance } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 30_000, // Consider data fresh for 30 seconds (increased from 10s)
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    },
  });

  // Check if balances are loading
  const isLoadingBalance = mode === 'invest' ? isLoadingUsdtBalance : isLoadingEtfBalance;

  // Parse shares amount
  const shares = useMemo(() => {
    try {
      return amount ? parseUnits(amount, 18) : BigInt(0);
    } catch {
      return BigInt(0);
    }
  }, [amount]);

  // Preview for invest (USDT needed)
  const { data: usdtNeeded } = useReadContract({
    address: routerAddress,
    abi: etfRouterABI,
    functionName: 'usdtNeededForShares',
    args: [shares],
    query: {
      enabled: shares > BigInt(0) && mode === 'invest',
    },
  });

  // Preview for redeem (USDT received)
  const { data: usdtReceived } = useReadContract({
    address: routerAddress,
    abi: etfRouterABI,
    functionName: 'sharesToUsdt',
    args: [shares],
    query: {
      enabled: shares > BigInt(0) && mode === 'redeem',
    },
  });


  const handleTrade = () => {
    if (!amount || !isConnected || shares === BigInt(0)) return;

    try {
      if (mode === 'invest' && onInvest && usdtNeeded) {
        // Add user-defined slippage for invest
        const maxUSDT = (usdtNeeded * BigInt(100 + slippage)) / BigInt(100);
        onInvest(shares, maxUSDT);
      } else if (mode === 'redeem' && onRedeem && usdtReceived) {
        // Subtract user-defined slippage for redeem
        const minUSDT = (usdtReceived * BigInt(100 - slippage)) / BigInt(100);
        onRedeem(shares, minUSDT);
      }
    } catch (error) {
      console.error('Trade error:', error);
    }
  };

  const getPreviewAmount = () => {
    if (mode === 'invest') {
      if (!usdtNeeded) return '0.00';
      // For invest, show the amount INCLUDING slippage (what user actually needs)
      const withSlippage = (usdtNeeded * BigInt(100 + slippage)) / BigInt(100);
      return parseFloat(formatUnits(withSlippage, 18)).toFixed(2);
    } else {
      if (!usdtReceived) return '0.00';
      // For redeem, show the amount AFTER slippage (what user actually receives)
      const afterSlippage = (usdtReceived * BigInt(100 - slippage)) / BigInt(100);
      return parseFloat(formatUnits(afterSlippage, 18)).toFixed(2);
    }
  };

  // Get current balance based on mode
  const getCurrentBalance = () => {
    if (mode === 'invest') {
      return usdtBalance || BigInt(0);
    } else {
      return etfBalance || BigInt(0);
    }
  };

  // Format balance for display
  const getFormattedBalance = () => {
    const balance = getCurrentBalance();
    return parseFloat(formatUnits(balance, 18)).toFixed(4);
  };

  // Check if user has sufficient balance
  const hasInsufficientBalance = useMemo(() => {
    if (!isConnected || shares === BigInt(0)) return false;

    if (mode === 'invest') {
      // For invest: check if we have enough USDT for the required amount
      if (!usdtNeeded || !usdtBalance) return false;
      // Include slippage in the check
      const maxUSDTWithSlippage = (usdtNeeded * BigInt(100 + slippage)) / BigInt(100);
      return usdtBalance < maxUSDTWithSlippage;
    } else {
      // For redeem: check if we have enough shares
      if (!etfBalance) return false;
      return etfBalance < shares;
    }
  }, [mode, shares, usdtNeeded, usdtBalance, etfBalance, slippage, isConnected]);

  // Handle MAX button click
  const handleMaxClick = async () => {
    if (mode === 'invest') {
      // For invest mode: We need to find the max shares we can buy with our USDT balance
      if (!usdtBalance || usdtBalance === BigInt(0)) {
        setAmount('0');
        return;
      }

      try {
        const { readContract } = await import('viem/actions');
        const { createPublicClient, http } = await import('viem');
        const { bsc, bscTestnet } = await import('viem/chains');

        const chain = chainId === 56 ? bsc : bscTestnet;
        const rpcUrl = chainId === 56
          ? 'https://bsc-dataseed.binance.org'
          : 'https://data-seed-prebsc-1-s1.binance.org:8545';

        const publicClient = createPublicClient({
          chain,
          transport: http(rpcUrl),
        });

        // Binary search approach to find maximum shares that fit within balance
        // Start with adjusted USDT
        const adjustedUSDT = (usdtBalance * BigInt(100)) / BigInt(100 + slippage);

        // Get initial estimate of shares
        let candidateShares = await readContract(publicClient, {
          address: routerAddress,
          abi: etfRouterABI,
          functionName: 'usdtToShares',
          args: [adjustedUSDT],
        }) as bigint;

        // Verify if this amount fits within our balance (including slippage)
        const usdtNeededForCandidate = await readContract(publicClient, {
          address: routerAddress,
          abi: etfRouterABI,
          functionName: 'usdtNeededForShares',
          args: [candidateShares],
        }) as bigint;

        const totalNeeded = (usdtNeededForCandidate * BigInt(100 + slippage)) / BigInt(100);

        // If it exceeds balance, reduce by 1% and try again iteratively
        if (totalNeeded > usdtBalance) {
          // Reduce candidate by the ratio of balance to total needed, with extra 0.5% safety margin
          candidateShares = (candidateShares * usdtBalance * BigInt(995)) / (totalNeeded * BigInt(1000));
        }

        if (candidateShares > BigInt(0)) {
          setAmount(formatUnits(candidateShares, 18));
        } else {
          setAmount('0');
        }
      } catch {
        // Fallback: use a very conservative estimate
        const conservativeUSDT = (usdtBalance * BigInt(95)) / BigInt(100 + slippage);
        setAmount(formatUnits(conservativeUSDT, 18));
      }
    } else {
      // For redeem mode: max is simply the ETF balance
      const maxShares = etfBalance || BigInt(0);
      if (maxShares > BigInt(0)) {
        setAmount(formatUnits(maxShares, 18));
      }
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-gray-700/50">
      <h3 className="text-lg font-bold mb-5 flex items-center text-gray-100">
        <span className="mr-2 text-2xl">💱</span>
        Trade Panel
      </h3>

      {/* Mode Selector */}
      <div className="flex gap-2 md:gap-3 mb-6">
        <button
          onClick={() => setMode('invest')}
          className={`flex-1 py-3 md:py-3 px-3 md:px-4 rounded-xl font-bold text-sm md:text-base transition-all duration-200 ${
            mode === 'invest'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-105 border border-gray-600/50'
          }`}
        >
          💰 Invest
        </button>
        <button
          onClick={() => setMode('redeem')}
          className={`flex-1 py-3 md:py-3 px-3 md:px-4 rounded-xl font-bold text-sm md:text-base transition-all duration-200 ${
            mode === 'redeem'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/50 scale-105'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-105 border border-gray-600/50'
          }`}
        >
          📤 Redeem
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm md:text-sm font-bold text-gray-300">
            {mode === 'invest' ? '🛒 Shares to Buy' : '💸 Shares to Sell'}
          </label>
          <div className="flex items-center gap-2">
            {!isConnected || isLoadingBalance ? (
              <div className="h-5 w-32 bg-gray-600/30 rounded animate-pulse"></div>
            ) : (
              <>
                <span className="text-xs text-gray-400">
                  Balance: <span className="font-semibold text-gray-300">{getFormattedBalance()}</span> {mode === 'invest' ? 'USDT' : 'Shares'}
                </span>
                <button
                  onClick={handleMaxClick}
                  disabled={!isConnected || isLoading || isLoadingBalance}
                  className="px-2 py-0.5 text-xs font-bold rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  MAX
                </button>
              </>
            )}
          </div>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          min="0"
          step="any"
          className="w-full px-4 py-4 md:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold text-lg md:text-lg text-gray-100 placeholder-gray-500"
          disabled={!isConnected || isLoading}
        />
      </div>

      {/* Preview */}
      <div className={`mb-6 p-4 md:p-5 rounded-xl border-2 backdrop-blur-sm ${
        mode === 'invest'
          ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/30'
          : 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30'
      }`}>
        <p className={`text-sm md:text-sm font-bold mb-2 ${
          mode === 'invest' ? 'text-blue-300' : 'text-purple-300'
        }`}>
          {mode === 'invest' ? '💵 Total USDT Needed' : '💰 USDT You Will Receive'}
        </p>
        {!isConnected || (shares > BigInt(0) && !amount) ? (
          <div className={`h-10 rounded animate-pulse ${
            mode === 'invest' ? 'bg-blue-700/30' : 'bg-purple-700/30'
          }`}></div>
        ) : (
          <p className={`text-2xl md:text-3xl font-bold ${
            mode === 'invest' ? 'text-blue-100' : 'text-purple-100'
          }`}>
            ${getPreviewAmount()}
          </p>
        )}
        <p className={`text-xs md:text-xs font-medium mt-2 ${
          mode === 'invest' ? 'text-blue-400' : 'text-purple-400'
        }`}>
          ⚡ {slippage}% slippage {mode === 'invest' ? 'included' : 'applied'}
        </p>
      </div>

      {/* Slippage Settings */}
      <div className="mb-5">
        <button
          onClick={() => setShowSlippageSettings(!showSlippageSettings)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-300"
        >
          <span className="text-sm font-medium">⚙️ Slippage Settings</span>
          <span className="text-xs text-gray-400">{slippage}%</span>
        </button>

        {showSlippageSettings && (
          <div className="mt-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 space-y-3">
            {/* Preset Buttons */}
            <div className="flex gap-2">
              {[3, 5, 10, 15].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSlippage(preset)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    slippage === preset
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Custom Slippage</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0 && value <= 50) {
                      setSlippage(value);
                    }
                  }}
                  min="0"
                  max="50"
                  step="0.1"
                  className="flex-1 px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {slippage < 3 && '⚠️ Low slippage may cause transaction failures'}
                {slippage >= 3 && slippage <= 10 && '✅ Recommended range'}
                {slippage > 10 && '⚠️ High slippage may result in worse prices'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Insufficient Balance Warning */}
      {hasInsufficientBalance && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm font-medium">
            ⚠️ Insufficient {mode === 'invest' ? 'USDT' : 'shares'} balance
          </p>
        </div>
      )}

      {/* Trade Button */}
      <button
        onClick={handleTrade}
        disabled={!isConnected || !amount || isLoading || hasInsufficientBalance}
        className={`w-full py-4 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-200 touch-manipulation ${
          !isConnected || !amount || isLoading || hasInsufficientBalance
            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/50'
            : mode === 'invest'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 hover:scale-105 active:scale-95'
            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 hover:scale-105 active:scale-95'
        }`}
      >
        {!isConnected
          ? '🔌 Connect Wallet'
          : isLoading
          ? '⏳ Processing...'
          : hasInsufficientBalance
          ? `❌ Insufficient ${mode === 'invest' ? 'USDT' : 'Shares'}`
          : mode === 'invest'
          ? '💰 Invest Now'
          : '📤 Redeem Now'}
      </button>
    </div>
  );
}
