'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import Link from 'next/link';
import { contractAddresses } from '@/lib/contracts/addresses';
import { useEffect, useState } from 'react';

// Mock ERC20 Faucet ABI
const faucetABI = [
  {
    inputs: [],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'canClaim',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'lastClaimTime',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'faucetCooldown',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'faucetAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getTimeUntilNextClaim',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const erc20ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Helper to get faucet config for current chain
function getFaucetConfig(chainId: number) {
  // Mainnet has no faucets
  if (chainId === 56) return [];

  const config = contractAddresses[chainId as 97 | 56];
  if (!config) return [];

  // Type guard: only testnet has faucets
  if (chainId === 97 && 'faucets' in config) {
    return [
      {
        name: 'USDT',
        token: config.tokens.usdt,
        faucet: config.faucets.usdt,
      },
    ];
  }

  return [];
}

interface TokenFaucetProps {
  name: string;
  token: `0x${string}`;
  faucet: `0x${string}`;
  userAddress?: `0x${string}`;
}

function TokenFaucet({ name, token, faucet, userAddress }: TokenFaucetProps) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: canClaim, refetch: refetchCanClaim } = useReadContract({
    address: faucet,
    abi: faucetABI,
    functionName: 'canClaim',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: isSuccess ? 2000 : false, // Refetch every 2s after success
    },
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: token,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: isSuccess ? 2000 : false, // Refetch every 2s after success
    },
  });

  const { data: decimals } = useReadContract({
    address: token,
    abi: erc20ABI,
    functionName: 'decimals',
  });

  const { data: faucetAmount } = useReadContract({
    address: faucet,
    abi: faucetABI,
    functionName: 'faucetAmount',
  });

  const { data: timeUntilNextClaim, refetch: refetchTimeUntilNext } = useReadContract({
    address: faucet,
    abi: faucetABI,
    functionName: 'getTimeUntilNextClaim',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 1000, // Refetch every second for countdown
    },
  });

  // Refetch canClaim and balance when transaction is successful
  useEffect(() => {
    if (isSuccess) {
      refetchCanClaim();
      refetchBalance();
      refetchTimeUntilNext();
    }
  }, [isSuccess, refetchCanClaim, refetchBalance, refetchTimeUntilNext]);

  const handleClaim = () => {
    writeContract({
      address: faucet,
      abi: faucetABI,
      functionName: 'claim',
    });
  };

  const formattedBalance = balance && decimals
    ? parseFloat(formatUnits(balance, decimals)).toFixed(4)
    : '0.0000';

  const formattedFaucetAmount = faucetAmount && decimals
    ? parseFloat(formatUnits(faucetAmount, decimals)).toFixed(0)
    : '...';

  // Format time remaining
  const formatTimeRemaining = (seconds: bigint | undefined): string => {
    if (!seconds || seconds === 0n) return '';

    const totalSeconds = Number(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const timeRemainingText = formatTimeRemaining(timeUntilNextClaim);

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-100">{name}</h3>
          <p className="text-sm text-gray-400">Claim: {formattedFaucetAmount} {name}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Your Balance</p>
          <p className="text-lg font-bold text-green-400">{formattedBalance}</p>
        </div>
      </div>

      <button
        onClick={handleClaim}
        disabled={!userAddress || isPending || isConfirming || !canClaim}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 md:py-3 rounded-xl font-bold text-base md:text-base hover:from-blue-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg disabled:shadow-none hover:scale-105 disabled:scale-100 active:scale-95 touch-manipulation"
      >
        {!userAddress
          ? '🔌 Connect Wallet'
          : isPending
          ? '⏳ Confirming...'
          : isConfirming
          ? '⏳ Processing...'
          : !canClaim && timeRemainingText
          ? `⏰ Wait ${timeRemainingText}`
          : !canClaim
          ? '✅ Already Claimed'
          : `💧 Claim ${formattedFaucetAmount} ${name}`}
      </button>

      {hash && (
        <p className="mt-3 text-sm text-green-400 text-center">
          ✅ Successfully claimed!{' '}
          <a
            href={`https://testnet.bscscan.com/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-300 transition-colors"
          >
            View transaction ↗
          </a>
        </p>
      )}
    </div>
  );
}

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const faucets = getFaucetConfig(chainId);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if on mainnet
  const isMainnet = chainId === 56;

  // Get cooldown period and faucet amount from the first faucet
  const config = contractAddresses[chainId as 97 | 56];
  const faucetAddress = chainId === 97 && config && 'faucets' in config ? config.faucets.usdt : undefined;

  const { data: cooldownPeriod } = useReadContract({
    address: faucetAddress as `0x${string}`,
    abi: faucetABI,
    functionName: 'faucetCooldown',
    query: {
      enabled: !!faucetAddress && !isMainnet,
    },
  });

  const { data: faucetAmount } = useReadContract({
    address: faucetAddress as `0x${string}`,
    abi: faucetABI,
    functionName: 'faucetAmount',
    query: {
      enabled: !!faucetAddress && !isMainnet,
    },
  });

  const { data: decimals } = useReadContract({
    address: config?.tokens.usdt as `0x${string}`,
    abi: erc20ABI,
    functionName: 'decimals',
    query: {
      enabled: !!config?.tokens.usdt && !isMainnet,
    },
  });

  const formattedFaucetAmount = faucetAmount && decimals
    ? parseFloat(formatUnits(faucetAmount, decimals)).toFixed(0)
    : '500';

  const formatCooldownPeriod = (seconds: bigint | undefined): string => {
    if (!seconds) return 'loading...';
    const totalSeconds = Number(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${totalSeconds} second${totalSeconds > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Logo + Desktop Navigation */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <span className="text-white font-bold text-lg sm:text-xl">B</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  BlockETF
                </h1>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden sm:flex space-x-6">
                <Link
                  href="/"
                  className="text-gray-400 hover:text-gray-300 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-gray-300 font-medium transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/faucet"
                  className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
                >
                  Faucet 💧
                </Link>
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
                  className="text-gray-400 hover:text-gray-300 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-700/50 text-right"
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
                <Link
                  href="/faucet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-blue-400 font-medium hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-700/50 text-right"
                >
                  Faucet 💧
                </Link>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            💧 USDT Faucet
          </h2>
          <p className="text-gray-400 text-lg">
            Claim test USDT to invest in BlockETF on BSC Testnet. Can be claimed once every {formatCooldownPeriod(cooldownPeriod)}.
          </p>
        </div>

        {isMainnet && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 mb-6 backdrop-blur-sm">
            <h3 className="text-red-400 font-bold text-xl mb-2 text-center">
              ⚠️ Faucet Not Available on Mainnet
            </h3>
            <p className="text-red-300 mb-4 text-center">
              The faucet is only available on BSC Testnet. Please switch to testnet to claim test tokens.
            </p>
            <div className="flex justify-center">
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg"
              >
                Go Back Home
              </Link>
            </div>
          </div>
        )}

        {!isConnected && !isMainnet && (
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-6 mb-6 backdrop-blur-sm">
            <p className="text-yellow-400 font-medium text-center">
              🔌 Please connect your wallet to claim test tokens
            </p>
          </div>
        )}

        {!isMainnet && (
          <div className="max-w-md mx-auto">
            {faucets.map((faucet) => (
              <TokenFaucet
                key={faucet.name}
                name={faucet.name}
                token={faucet.token as `0x${string}`}
                faucet={faucet.faucet as `0x${string}`}
                userAddress={address}
              />
            ))}
          </div>
        )}

        {/* Instructions - Only show on testnet */}
        {!isMainnet && (
          <div className="mt-12 bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold mb-5 text-gray-100 flex items-center">
              <span className="mr-2 text-2xl">📖</span>
              How to Use
            </h3>
            <ol className="space-y-4 text-gray-300">
              <li className="flex items-start">
                <span className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 font-bold shadow-lg shadow-blue-500/50">
                  1
                </span>
                <span>Connect your wallet to BSC Testnet (ChainID: 97)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 font-bold shadow-lg shadow-blue-500/50">
                  2
                </span>
                <span>
                  Get some test BNB from{' '}
                  <a
                    href="https://testnet.bnbchain.org/faucet-smart"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline transition-colors"
                  >
                    BNB Faucet
                  </a>
                  {' '}for gas fees
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 font-bold shadow-lg shadow-blue-500/50">
                  3
                </span>
                <span>Claim {formattedFaucetAmount} test USDT from the faucet above</span>
              </li>
              <li className="flex items-start">
                <span className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 font-bold shadow-lg shadow-blue-500/50">
                  4
                </span>
                <span>
                  Go back to{' '}
                  <Link href="/" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                    Home
                  </Link>
                  {' '}and start investing in BlockETF!
                </span>
              </li>
            </ol>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p className="text-yellow-500/80">
            ⚠️ These are testnet tokens with no real value. For testing purposes only.
          </p>
        </footer>
      </main>
    </div>
  );
}
