'use client';

import { formatUnits } from 'viem';
import { useChainId } from 'wagmi';
import { getContractAddress } from '@/lib/contracts/addresses';

interface Asset {
  token: string;
  weight: number;
  reserve: bigint;
  price?: bigint;
  symbol?: string;
}

interface FeeInfo {
  withdrawFee: number;
  managementFeeRate: bigint;
  accumulatedFee: bigint;
  lastCollectTime: bigint;
}

interface ETFOverviewProps {
  sharePrice?: bigint;
  totalValue?: bigint;
  totalSupply?: bigint;
  assets?: Asset[];
  isLoading?: boolean;
  etfName?: string;
  etfSymbol?: string;
  feeInfo?: FeeInfo;
}

export function ETFOverview({
  sharePrice,
  totalValue,
  totalSupply,
  assets = [],
  isLoading = false,
  etfName,
  etfSymbol,
  feeInfo,
}: ETFOverviewProps) {
  // Hooks must be called at the top level, before any early returns
  const chainId = useChainId();
  const etfCoreAddress = getContractAddress(chainId as 56 | 97, 'blockETFCore');

  // Get block explorer URL based on chain
  const explorerUrl = chainId === 56
    ? `https://bscscan.com/token/${etfCoreAddress}`
    : `https://testnet.bscscan.com/token/${etfCoreAddress}`;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (value?: bigint) => {
    if (!value) return '$0.00';
    return `$${parseFloat(formatUnits(value, 18)).toFixed(2)}`;
  };

  const formatTVL = (value?: bigint) => {
    if (!value) return '$0';
    const num = parseFloat(formatUnits(value, 18));
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  const formatReserve = (reserve?: bigint, decimals: number = 18) => {
    if (!reserve) return '0';
    const num = parseFloat(formatUnits(reserve, decimals));
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(3)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(3)}K`;
    }
    if (num >= 1) {
      return num.toFixed(3);
    }
    return num.toFixed(6);
  };

  const formatSupply = (supply?: bigint) => {
    if (!supply) return '0';
    const num = parseFloat(formatUnits(supply, 18));
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-gray-700/50">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {etfName && etfSymbol
              ? `${etfName} (${etfSymbol})`
              : etfName || etfSymbol || 'BlockETF'
            }
          </h2>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 text-sm font-medium transition-all duration-200 hover:scale-105"
          >
            <span>📝 View Contract</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-xl p-5 md:p-6 border border-blue-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm md:text-sm font-medium text-blue-300">Share Price</p>
            <span className="text-xl md:text-2xl">💰</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-blue-100">{formatPrice(sharePrice)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-xl p-5 md:p-6 border border-purple-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm md:text-sm font-medium text-purple-300">Total Value Locked</p>
            <span className="text-xl md:text-2xl">🔒</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-purple-100">{formatTVL(totalValue)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-xl p-5 md:p-6 border border-green-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm md:text-sm font-medium text-green-300">Total Supply</p>
            <span className="text-xl md:text-2xl">📊</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-green-100">{formatSupply(totalSupply)}</p>
        </div>
      </div>

      {/* Fee Information Card */}
      {feeInfo && (
        <div className="mb-8 p-6 bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 rounded-xl backdrop-blur-sm">
          <h3 className="text-lg font-bold text-indigo-200 mb-5 flex items-center">
            <span className="mr-2 text-2xl">💳</span>
            Fee Structure
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/60 backdrop-blur rounded-lg p-4 border border-indigo-400/20">
              <p className="text-sm text-indigo-300 mb-2 font-medium">Redemption Fee</p>
              <p className="text-3xl font-bold text-indigo-100">
                {(() => {
                  // withdrawFee is in basis points (bps), 1 bps = 0.01%
                  const withdrawFeeBps = typeof feeInfo.withdrawFee === 'bigint'
                    ? Number(feeInfo.withdrawFee)
                    : feeInfo.withdrawFee;
                  const feePercentage = (withdrawFeeBps / 100).toFixed(2);
                  return feePercentage;
                })()}%
              </p>
              <p className="text-xs text-indigo-400 mt-2">Applied on withdrawals</p>
            </div>
            <div className="bg-gray-800/60 backdrop-blur rounded-lg p-4 border border-indigo-400/20">
              <p className="text-sm text-indigo-300 mb-2 font-medium">Annual Management Fee</p>
              <p className="text-3xl font-bold text-indigo-100">
                {(() => {
                  // Convert managementFeeRate back to annual bps
                  const managementFeeRate = typeof feeInfo.managementFeeRate === 'bigint'
                    ? Number(feeInfo.managementFeeRate)
                    : feeInfo.managementFeeRate;
                  const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
                  const WEIGHT_PRECISION = 10000;
                  const FEE_PRECISION = 1e27;

                  const annualFeeBps = (managementFeeRate * SECONDS_PER_YEAR * WEIGHT_PRECISION) / FEE_PRECISION;
                  const annualFeePercent = (annualFeeBps / 100).toFixed(2);
                  return annualFeePercent;
                })()}%
              </p>
              <p className="text-xs text-indigo-400 mt-2">Accrued continuously</p>
            </div>
          </div>
        </div>
      )}


      <div>
        <h3 className="text-xl md:text-lg font-bold text-gray-100 mb-5 flex items-center">
          <span className="mr-2 text-2xl">📈</span>
          Portfolio Composition
        </h3>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-700/50">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-800/80 to-gray-900/80">
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-300">
                  Asset
                </th>
                <th className="text-right py-4 px-6 text-sm font-bold text-gray-300">
                  Target Weight
                </th>
                <th className="text-right py-4 px-6 text-sm font-bold text-gray-300">
                  Current Weight
                </th>
                <th className="text-right py-4 px-6 text-sm font-bold text-gray-300">
                  Reserve
                </th>
                <th className="text-right py-4 px-6 text-sm font-bold text-gray-300">
                  Price
                </th>
                <th className="text-right py-4 px-6 text-sm font-bold text-gray-300">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => {
                const targetWeight = asset.weight / 100; // Convert from basis points to percentage
                const value = asset.price
                  ? (asset.reserve * asset.price) / BigInt(10 ** 18)
                  : BigInt(0);

                // Calculate current weight (actual weight based on current value)
                const currentWeight = totalValue && totalValue > BigInt(0)
                  ? Number((value * BigInt(10000)) / totalValue) / 100
                  : 0;

                // Calculate deviation
                const deviation = currentWeight - targetWeight;
                const isDeviated = Math.abs(deviation) > 0.5; // More than 0.5% deviation

                return (
                  <tr
                    key={index}
                    className="border-b border-gray-700/50 hover:bg-gradient-to-r hover:from-blue-900/20 hover:to-purple-900/20 transition-all duration-200"
                  >
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-100 text-base">
                        {asset.symbol || `Asset ${index + 1}`}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-block text-sm font-bold text-gray-300 bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-600/50">
                        {targetWeight.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className={`inline-block text-sm font-bold px-3 py-1.5 rounded-lg border ${
                          isDeviated
                            ? deviation > 0
                              ? 'text-green-300 bg-green-900/40 border-green-500/50'
                              : 'text-orange-300 bg-orange-900/40 border-orange-500/50'
                            : 'text-blue-300 bg-blue-900/40 border-blue-500/50'
                        }`}>
                          {currentWeight.toFixed(1)}%
                        </span>
                        {isDeviated && (
                          <span className={`text-xs font-semibold ${
                            deviation > 0 ? 'text-green-400' : 'text-orange-400'
                          }`}>
                            {deviation > 0 ? '↗' : '↘'}{Math.abs(deviation).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-300">
                      {formatReserve(asset.reserve, 18)}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-300">
                      {formatPrice(asset.price)}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-gray-100 text-base">
                      {formatTVL(value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {assets.map((asset, index) => {
            const targetWeight = asset.weight / 100;
            const value = asset.price
              ? (asset.reserve * asset.price) / BigInt(10 ** 18)
              : BigInt(0);
            const currentWeight = totalValue && totalValue > BigInt(0)
              ? Number((value * BigInt(10000)) / totalValue) / 100
              : 0;
            const deviation = currentWeight - targetWeight;
            const isDeviated = Math.abs(deviation) > 0.5;

            return (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50"
              >
                {/* Asset Name & Value */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-gray-100">
                    {asset.symbol || `Asset ${index + 1}`}
                  </h4>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Value</p>
                    <p className="text-lg font-bold text-gray-100">{formatTVL(value)}</p>
                  </div>
                </div>

                {/* Weights */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Target Weight</p>
                    <p className="text-base font-bold text-gray-200">{targetWeight.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Current Weight</p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-base font-bold ${
                        isDeviated
                          ? deviation > 0
                            ? 'text-green-400'
                            : 'text-orange-400'
                          : 'text-blue-400'
                      }`}>
                        {currentWeight.toFixed(1)}%
                      </span>
                      {isDeviated && (
                        <span className={`text-xs font-semibold ${
                          deviation > 0 ? 'text-green-400' : 'text-orange-400'
                        }`}>
                          {deviation > 0 ? '↗' : '↘'}{Math.abs(deviation).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reserve & Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Reserve</p>
                    <p className="text-sm font-semibold text-gray-300">{formatReserve(asset.reserve, 18)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Price</p>
                    <p className="text-sm font-semibold text-gray-300">{formatPrice(asset.price)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
