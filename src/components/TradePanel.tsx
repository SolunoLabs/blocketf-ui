'use client';

import { useState, useMemo, useEffect } from 'react';
import { formatUnits, parseUnits, maxUint256 } from 'viem';
import { useReadContract, useChainId, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { etfRouterABI, erc20ABI, blockETFCoreABI } from '@/lib/contracts/abis';
import { getContractAddress } from '@/lib/contracts/addresses';
import { ToastType } from '@/components/Toast';

type TradeMode = 'invest' | 'redeem';

interface TradePanelProps {
  isConnected: boolean;
  onInvest?: (shares: bigint, maxUSDT: bigint) => void;
  onRedeem?: (shares: bigint, minUSDT: bigint) => void;
  onShowToast?: (type: ToastType, message: string, txHash?: `0x${string}`) => void;
  isParentProcessing?: boolean; // Track if parent (page.tsx) is processing invest/redeem
}

export function TradePanel({
  isConnected,
  onInvest,
  onRedeem,
  onShowToast,
  isParentProcessing = false,
}: TradePanelProps) {
  const chainId = useChainId();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();

  const routerAddress = getContractAddress(chainId as 56 | 97, 'etfRouter');
  const usdtAddress = getContractAddress(chainId as 56 | 97, 'usdt');
  const etfCoreAddress = getContractAddress(chainId as 56 | 97, 'blockETFCore');

  const [mode, setMode] = useState<TradeMode>('invest');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState<number>(3); // Default 3%
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>();

  // Wait for transaction confirmation
  const {
    isSuccess: isTxConfirmed,
    isError: isTxFailed,
    error: txError
  } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  });

  // Query USDT balance
  const { data: usdtBalance, isLoading: isLoadingUsdtBalance } = useReadContract({
    address: usdtAddress,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
    },
  });

  // Query ETF shares balance
  const { data: etfBalance, isLoading: isLoadingEtfBalance } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
    },
  });

  // Query USDT allowance for router (for invest mode)
  const { data: usdtAllowance, refetch: refetchUsdtAllowance } = useReadContract({
    address: usdtAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: address ? [address, routerAddress] : undefined,
    query: {
      enabled: !!address && mode === 'invest',
      staleTime: 10_000,
    },
  });

  // Query ETF allowance for router (for redeem mode)
  // Use erc20ABI for standard ERC20 functions
  const { data: etfAllowance, refetch: refetchEtfAllowance } = useReadContract({
    address: etfCoreAddress,
    abi: erc20ABI,  // Use erc20ABI for allowance (standard ERC20 function)
    functionName: 'allowance',
    args: address ? [address, routerAddress] : undefined,
    query: {
      enabled: !!address && mode === 'redeem',
      staleTime: 10_000,
    },
  });

  // Refresh data when approve transaction is confirmed
  useEffect(() => {
    if (isTxConfirmed && lastTxHash) {
      console.log('[Approval] Transaction confirmed, refreshing allowance...');

      // Directly refetch the allowance for the current mode
      const refetchPromise = mode === 'invest'
        ? refetchUsdtAllowance()
        : refetchEtfAllowance();

      refetchPromise.then(() => {
        console.log('[Approval] Allowance refetch completed');

        // Show success toast via parent callback
        onShowToast?.('success', 'Approval confirmed! You can now proceed with the trade.');
        setIsProcessing(false);
        setLastTxHash(undefined); // Clear lastTxHash to update button state
      });
    }
  }, [isTxConfirmed, lastTxHash, mode, refetchUsdtAllowance, refetchEtfAllowance, onShowToast]);

  // Handle transaction failure
  useEffect(() => {
    if (isTxFailed && lastTxHash) {
      console.error('[Approval Transaction] Failed:', lastTxHash, txError);
      const errorMsg = txError instanceof Error ? txError.message : 'Transaction failed';

      // Show error toast via parent callback
      onShowToast?.('error', errorMsg);
      setIsProcessing(false);
      setLastTxHash(undefined); // Clear lastTxHash to update button state
    }
  }, [isTxFailed, lastTxHash, txError, onShowToast]);

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

  // Calculate required amounts with slippage
  const requiredUSDT = useMemo(() => {
    if (!usdtNeeded) return BigInt(0);
    return (usdtNeeded * BigInt(100 + slippage)) / BigInt(100);
  }, [usdtNeeded, slippage]);

  const minUSDTReceived = useMemo(() => {
    if (!usdtReceived) return BigInt(0);
    return (usdtReceived * BigInt(100 - slippage)) / BigInt(100);
  }, [usdtReceived, slippage]);

  // Check if approval is needed
  const needsApproval = useMemo(() => {
    if (!isConnected || shares === BigInt(0)) return false;

    if (mode === 'invest') {
      // Check if we have required data - must have both allowance and usdtNeeded
      if (usdtAllowance === undefined || !usdtNeeded) return false;
      // requiredUSDT will be > 0 if usdtNeeded exists
      return usdtAllowance < requiredUSDT;
    } else {
      // For redeem mode, check ETF allowance
      if (etfAllowance === undefined) return false;
      return etfAllowance < shares;
    }
  }, [mode, shares, usdtAllowance, etfAllowance, requiredUSDT, isConnected, usdtNeeded]);

  // Check if user has sufficient balance
  const hasInsufficientBalance = useMemo(() => {
    if (!isConnected || shares === BigInt(0)) return false;

    if (mode === 'invest') {
      // Check if we have required data - must have both usdtNeeded and balance
      if (!usdtNeeded || usdtBalance === undefined) return false;
      return usdtBalance < requiredUSDT;
    } else {
      // Check if we have required data (allow 0 balance)
      if (etfBalance === undefined) return false;
      return etfBalance < shares;
    }
  }, [mode, shares, requiredUSDT, usdtBalance, etfBalance, isConnected, usdtNeeded]);

  // Handle approval
  const handleApprove = async () => {
    if (!address) return;

    try {
      setIsProcessing(true);

      const tokenAddress = mode === 'invest' ? usdtAddress : etfCoreAddress;
      const tokenName = mode === 'invest' ? 'USDT' : 'ETF Shares';

      // Show loading toast via parent callback
      onShowToast?.('loading', `Approving ${tokenName}...`);

      // Approve with unlimited allowance
      // Use erc20ABI for both USDT and ETF shares (both are ERC20 tokens)
      const approveTx = await writeContractAsync({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'approve',
        args: [routerAddress, maxUint256],
      });

      setLastTxHash(approveTx);
      onShowToast?.('loading', 'Waiting for confirmation...', approveTx);

      // Transaction is pending, wait for confirmation
      // The useEffect will handle showing success/error toast when confirmed
    } catch (error) {
      console.error('[Approval] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Approval failed';

      onShowToast?.('error', errorMessage);
      setIsProcessing(false);
    }
  };

  // Handle trade (invest or redeem)
  const handleTrade = () => {
    if (!amount || !isConnected || shares === BigInt(0)) return;

    try {
      if (mode === 'invest' && onInvest && requiredUSDT) {
        onInvest(shares, requiredUSDT);
      } else if (mode === 'redeem' && onRedeem && minUSDTReceived) {
        onRedeem(shares, minUSDTReceived);
      }
    } catch (error) {
      console.error('Trade error:', error);
    }
  };

  const getPreviewAmount = () => {
    if (mode === 'invest') {
      if (!usdtNeeded) return '0.00';
      return parseFloat(formatUnits(requiredUSDT, 18)).toFixed(2);
    } else {
      if (!usdtReceived) return '0.00';
      return parseFloat(formatUnits(minUSDTReceived, 18)).toFixed(2);
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

  // Get button text, disabled state, and loading state
  const getButtonState = () => {
    if (!isConnected) {
      return { text: '🔌 Connect Wallet', disabled: true, isLoading: false };
    }
    if (!amount || shares === BigInt(0)) {
      return { text: mode === 'invest' ? '💰 Invest Now' : '📤 Redeem Now', disabled: true, isLoading: false };
    }
    // Check if parent is processing invest/redeem transaction
    if (isParentProcessing) {
      return {
        text: mode === 'invest' ? 'Investing...' : 'Redeeming...',
        disabled: true,
        isLoading: true
      };
    }
    // Check if TradePanel is processing approval transaction
    if (isProcessing || lastTxHash) {
      const tokenName = mode === 'invest' ? 'USDT' : 'ETF Shares';
      return {
        text: needsApproval ? `Approving ${tokenName}...` : 'Processing...',
        disabled: true,
        isLoading: true
      };
    }
    if (hasInsufficientBalance) {
      return {
        text: `❌ Insufficient ${mode === 'invest' ? 'USDT' : 'Shares'}`,
        disabled: true,
        isLoading: false
      };
    }
    if (needsApproval) {
      return {
        text: `✅ Approve ${mode === 'invest' ? 'USDT' : 'ETF Shares'}`,
        disabled: false,
        isLoading: false
      };
    }
    return {
      text: mode === 'invest' ? '💰 Invest Now' : '📤 Redeem Now',
      disabled: false,
      isLoading: false
    };
  };

  const buttonState = getButtonState();

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
                  disabled={!isConnected || isProcessing || isLoadingBalance}
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
          disabled={!isConnected || isProcessing}
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

      {/* Trade/Approve Button */}
      <button
        onClick={needsApproval ? handleApprove : handleTrade}
        disabled={buttonState.disabled}
        className={`w-full py-4 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-200 touch-manipulation flex items-center justify-center gap-2 ${
          buttonState.disabled
            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-600/50'
            : needsApproval
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/50 hover:scale-105 active:scale-95'
            : mode === 'invest'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 hover:scale-105 active:scale-95'
            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 hover:scale-105 active:scale-95'
        }`}
      >
        {buttonState.isLoading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        )}
        <span>{buttonState.text}</span>
      </button>
    </div>
  );
}
