import { useChainId } from 'wagmi';
import { ETF_CONFIG, getETFAssets, NETWORK_CONFIG } from '@/lib/contracts/config';
import type { ETFAsset } from '@/lib/contracts/config';

/**
 * Hook to get ETF configuration
 */
export function useETFConfig() {
  return ETF_CONFIG;
}

/**
 * Hook to get ETF assets for current chain
 */
export function useETFAssets(): ETFAsset[] {
  const chainId = useChainId();
  return getETFAssets(chainId);
}

/**
 * Hook to get network configuration
 */
export function useNetworkConfig() {
  const chainId = useChainId();
  const supportedChainId = (chainId === 56 || chainId === 97) ? chainId : 97;
  return NETWORK_CONFIG[supportedChainId];
}

/**
 * Hook to get block explorer URL for current chain
 */
export function useBlockExplorer() {
  const network = useNetworkConfig();
  return network.blockExplorer;
}

/**
 * Helper to format transaction hash as block explorer link
 */
export function useTransactionLink(txHash?: string): string | null {
  const explorer = useBlockExplorer();
  return txHash ? `${explorer}/tx/${txHash}` : null;
}

/**
 * Helper to format address as block explorer link
 */
export function useAddressLink(address?: string): string | null {
  const explorer = useBlockExplorer();
  return address ? `${explorer}/address/${address}` : null;
}
