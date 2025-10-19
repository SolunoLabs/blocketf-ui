'use client';

import { useETFAssets, useETFConfig } from '@/hooks/useETFConfig';
import { formatPercentage } from '@/lib/contracts/config';

export function ETFComposition() {
  const assets = useETFAssets();
  const config = useETFConfig();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{config.name}</h2>
        <p className="text-gray-600 dark:text-gray-400">{config.symbol}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          {config.description}
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Asset Composition</h3>

        <div className="space-y-3">
          {assets.map((asset) => (
            <div
              key={asset.symbol}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                  {asset.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium">{asset.symbol}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {asset.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  {formatPercentage(asset.weight)}
                </p>
                <p className="text-xs text-gray-500">weight</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Fee Structure</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Withdraw Fee
            </p>
            <p className="text-xl font-bold">
              {formatPercentage(config.fees.withdrawFee)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Management Fee
            </p>
            <p className="text-xl font-bold">
              {formatPercentage(config.fees.managementFee)}
            </p>
            <p className="text-xs text-gray-500">per year</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ETFCompositionChart() {
  const assets = useETFAssets();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Weight Distribution</h3>

      {/* Simple bar chart */}
      <div className="space-y-3">
        {assets.map((asset) => (
          <div key={asset.symbol}>
            <div className="flex justify-between text-sm mb-1">
              <span>{asset.symbol}</span>
              <span className="font-medium">
                {formatPercentage(asset.weight)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${asset.weight / 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 Equal-weighted index ensures balanced exposure across all assets
        </p>
      </div>
    </div>
  );
}
