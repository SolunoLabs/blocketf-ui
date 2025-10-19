'use client';

import { useChainId, useSwitchChain } from 'wagmi';

export function NetworkSwitcher() {
  const chainId = useChainId();
  const { switchChain, chains } = useSwitchChain();

  const currentNetwork = chains.find((chain) => chain.id === chainId);
  const isMainnet = chainId === 56;
  const isTestnet = chainId === 97;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
        <div
          className={`w-2 h-2 rounded-full ${
            isMainnet
              ? 'bg-green-500'
              : isTestnet
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-medium">
          {currentNetwork?.name || 'Unknown Network'}
        </span>
      </div>

      <div className="flex gap-1">
        {chains.map((chain) => (
          <button
            key={chain.id}
            onClick={() => switchChain({ chainId: chain.id })}
            disabled={chain.id === chainId}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              chain.id === chainId
                ? 'bg-blue-600 text-white cursor-default'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {chain.id === 56 ? '🌐 Mainnet' : '🧪 Testnet'}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NetworkBadge() {
  const chainId = useChainId();
  const isMainnet = chainId === 56;
  const isTestnet = chainId === 97;

  if (!isMainnet && !isTestnet) {
    return (
      <div className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
        ⚠️ Unsupported Network
      </div>
    );
  }

  return (
    <div
      className={`px-3 py-1 text-xs rounded-full ${
        isMainnet
          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      }`}
    >
      {isMainnet ? '🌐 BSC Mainnet' : '🧪 BSC Testnet'}
    </div>
  );
}
