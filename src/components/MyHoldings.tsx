'use client';

import { formatUnits } from 'viem';
import { useAccount, useReadContract, useChainId } from 'wagmi';
import { blockETFCoreABI } from '@/lib/contracts/abis';
import { getContractAddress } from '@/lib/contracts/addresses';

interface MyHoldingsProps {
  isConnected: boolean;
}

export function MyHoldings({ isConnected }: MyHoldingsProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const etfCoreAddress = getContractAddress(chainId as 56 | 97, 'blockETFCore');

  // Fetch user's share balance
  const { data: shares, isLoading: isLoadingShares } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchOnWindowFocus: false,
    },
  });

  // Fetch share price
  const { data: sharePrice, isLoading: isLoadingPrice } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'getShareValue',
    query: {
      refetchOnWindowFocus: false,
    },
  });

  const isLoading = isLoadingShares || isLoadingPrice;
  if (!isConnected) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold mb-4 flex items-center text-gray-100">
          <span className="mr-2 text-2xl">💼</span>
          My Holdings
        </h3>
        <div className="bg-gradient-to-br from-gray-700/40 to-gray-800/40 rounded-lg p-6 text-center border border-gray-600/50">
          <p className="text-gray-400">
            🔌 Connect your wallet to view your holdings
          </p>
        </div>
      </div>
    );
  }

  const sharesFormatted = shares
    ? parseFloat(formatUnits(shares, 18)).toFixed(4)
    : '0.0000';

  const value =
    shares && sharePrice
      ? (shares * sharePrice) / BigInt(10 ** 18)
      : BigInt(0);

  const valueFormatted = `$${parseFloat(formatUnits(value, 18)).toFixed(2)}`;

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-2xl p-5 md:p-6 border border-gray-700/50">
      <h3 className="text-lg md:text-lg font-bold mb-4 md:mb-5 flex items-center text-gray-100">
        <span className="mr-2 text-2xl">💼</span>
        My Holdings
      </h3>
      <div className="space-y-3 md:space-y-4">
        <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-lg p-4 border border-blue-500/30 backdrop-blur-sm">
          <p className="text-sm md:text-sm font-medium text-blue-300 mb-1">Shares</p>
          {isLoading ? (
            <div className="h-8 bg-blue-700/30 rounded animate-pulse"></div>
          ) : (
            <p className="text-xl md:text-2xl font-bold text-blue-100">{sharesFormatted}</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-lg p-4 border border-green-500/30 backdrop-blur-sm">
          <p className="text-sm md:text-sm font-medium text-green-300 mb-1">Value</p>
          {isLoading ? (
            <div className="h-8 bg-green-700/30 rounded animate-pulse"></div>
          ) : (
            <p className="text-xl md:text-2xl font-bold text-green-100">
              {valueFormatted}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
