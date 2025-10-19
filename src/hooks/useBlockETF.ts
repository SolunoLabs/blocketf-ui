import { useReadContract, useReadContracts } from 'wagmi';
import { blockETFCoreABI, priceOracleABI, etfRouterABI, erc20ABI } from '@/lib/contracts/abis';
import { getContractAddress } from '@/lib/contracts/addresses';
import { useChainId } from 'wagmi';

export function useBlockETFData() {
  const chainId = useChainId();

  // Get contract addresses
  const etfCoreAddress = getContractAddress(chainId as 56 | 97, 'blockETFCore');
  const priceOracleAddress = getContractAddress(chainId as 56 | 97, 'priceOracle');

  // Read ETF core data
  const { data: assets } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'getAssets',
  });

  const { data: totalValue } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'getTotalValue',
  });

  const { data: shareValue } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'getShareValue',
  });

  const { data: totalSupply } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'totalSupply',
  });

  const { data: isPaused } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'isPaused',
  });

  const { data: etfName } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'name',
  });

  const { data: etfSymbol } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'symbol',
  });

  // Get asset prices if we have assets
  const assetAddresses = assets?.map((asset) => asset.token) || [];

  const { data: prices } = useReadContract({
    address: priceOracleAddress,
    abi: priceOracleABI,
    functionName: 'getPrices',
    args: [assetAddresses],
    query: {
      enabled: assetAddresses.length > 0,
    },
  });

  // Get token symbols using useReadContracts for batch reading
  const symbolCalls = assetAddresses.map((address) => ({
    address: address as `0x${string}`,
    abi: erc20ABI,
    functionName: 'symbol' as const,
  }));

  const { data: symbolsData } = useReadContracts({
    contracts: symbolCalls,
    query: {
      enabled: assetAddresses.length > 0,
    },
  });

  // Extract symbols from the results
  const symbols = symbolsData?.map((result) => result.result as string) || [];

  // Combine asset data with prices and symbols
  const assetsWithPrices = assets?.map((asset, index) => ({
    ...asset,
    price: prices?.[index],
    symbol: symbols?.[index] || `Asset ${index + 1}`,
  }));

  return {
    assets: assetsWithPrices,
    totalValue,
    shareValue,
    totalSupply,
    isPaused,
    etfName,
    etfSymbol,
  };
}

export function useUserBalance(userAddress?: `0x${string}`) {
  const chainId = useChainId();
  const etfCoreAddress = getContractAddress(chainId as 56 | 97, 'blockETFCore');

  const { data: balance, isLoading } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    balance,
    isLoading,
  };
}

export function useTradePreview(shares: bigint) {
  const chainId = useChainId();
  const routerAddress = getContractAddress(chainId as 56 | 97, 'etfRouter');

  const { data: usdtNeeded } = useReadContract({
    address: routerAddress,
    abi: etfRouterABI,
    functionName: 'usdtNeededForShares',
    args: [shares],
    query: {
      enabled: shares > BigInt(0),
    },
  });

  const { data: usdtReceived } = useReadContract({
    address: routerAddress,
    abi: etfRouterABI,
    functionName: 'sharesToUsdt',
    args: [shares],
    query: {
      enabled: shares > BigInt(0),
    },
  });

  return {
    usdtNeeded,
    usdtReceived,
  };
}
