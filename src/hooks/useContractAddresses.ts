import { useChainId } from 'wagmi';
import { contractAddresses } from '@/lib/contracts/addresses';
import type { SupportedChainId } from '@/lib/contracts/addresses';

/**
 * Hook to get contract addresses for the current chain
 */
export function useContractAddresses() {
  const chainId = useChainId();

  // Default to mainnet if chain not supported
  const supportedChainId: SupportedChainId =
    chainId in contractAddresses ? (chainId as SupportedChainId) : 56;

  const addresses = contractAddresses[supportedChainId];

  return {
    chainId: supportedChainId,
    ...addresses,
  };
}

/**
 * Hook to get a specific contract address
 */
export function useContractAddress(
  contract: keyof typeof contractAddresses[SupportedChainId]
): `0x${string}` {
  const chainId = useChainId();
  const supportedChainId: SupportedChainId =
    chainId in contractAddresses ? (chainId as SupportedChainId) : 56;

  return contractAddresses[supportedChainId][contract] as `0x${string}`;
}

/**
 * Hook to check if current chain is mainnet
 */
export function useIsMainnet(): boolean {
  const chainId = useChainId();
  return chainId === 56;
}

/**
 * Hook to check if current chain is testnet
 */
export function useIsTestnet(): boolean {
  const chainId = useChainId();
  return chainId === 97;
}
