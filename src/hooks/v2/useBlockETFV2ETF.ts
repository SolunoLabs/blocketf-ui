'use client'

import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useAccount, useChainId, useReadContract, useReadContracts } from 'wagmi'
import {
  blockETFV2CoreABI,
  blockETFV2FactoryABI,
  blockETFV2LensABI,
  erc20ABI,
  priceOracleABI,
  vTokenABI,
} from '@/lib/contracts/abis'
import { getExplorerBaseUrl } from '@/lib/contracts/config'
import { contractAddresses, getSupportedChainId, getV2Contracts, type Address } from '@/lib/contracts/addresses'

const EMPTY_ADDRESS = zeroAddress as Address
const FEATURED_ETF_MAINNET = '0xF61E981654AD8868872304A4F617d61E25cEf69B' as Address
const INITIAL_MAINNET_TOTAL_VALUE = 25n * 10n ** 18n
const INITIAL_MAINNET_TOTAL_SUPPLY = 24959297756779289685n
const INITIAL_MAINNET_SHARE_VALUE = 1001630744727569709n

const MAINNET_SNAPSHOT_PORTFOLIO = [
  {
    token: contractAddresses[56].tokens.btcb as Address,
    vToken: EMPTY_ADDRESS,
    weight: 2500,
    reserve: 0n,
    symbol: 'BTCB',
    value: 6250000000000000000n,
    currentWeight: 2500n,
    targetWeight: 2500n,
    venusEnabled: false,
  },
  {
    token: contractAddresses[56].tokens.eth as Address,
    vToken: EMPTY_ADDRESS,
    weight: 2500,
    reserve: 0n,
    symbol: 'ETH',
    value: 6250000000000000000n,
    currentWeight: 2500n,
    targetWeight: 2500n,
    venusEnabled: false,
  },
  {
    token: contractAddresses[56].tokens.wbnb as Address,
    vToken: EMPTY_ADDRESS,
    weight: 1400,
    reserve: 0n,
    symbol: 'WBNB',
    value: 3500000000000000000n,
    currentWeight: 1400n,
    targetWeight: 1400n,
    venusEnabled: false,
  },
  {
    token: contractAddresses[56].tokens.xrp as Address,
    vToken: EMPTY_ADDRESS,
    weight: 1400,
    reserve: 0n,
    symbol: 'XRP',
    value: 3500000000000000000n,
    currentWeight: 1400n,
    targetWeight: 1400n,
    venusEnabled: false,
  },
  {
    token: contractAddresses[56].tokens.sol as Address,
    vToken: EMPTY_ADDRESS,
    weight: 1400,
    reserve: 0n,
    symbol: 'SOL',
    value: 3500000000000000000n,
    currentWeight: 1400n,
    targetWeight: 1400n,
    venusEnabled: false,
  },
  {
    token: contractAddresses[56].usdt as Address,
    vToken: EMPTY_ADDRESS,
    weight: 800,
    reserve: 0n,
    symbol: 'USDT',
    value: 2000000000000000000n,
    currentWeight: 800n,
    targetWeight: 800n,
    venusEnabled: false,
  },
] as const

function trustLevelLabel(level?: number) {
  switch (level) {
    case 0:
      return 'Official'
    case 1:
      return 'Certified'
    case 2:
      return 'Community'
    default:
      return 'Unknown'
  }
}

function sameAddress(a?: Address | null, b?: Address | null) {
  if (!a || !b) return false
  return a.toLowerCase() === b.toLowerCase()
}

export function useBlockETFV2ETF(etfAddress?: Address | null) {
  const chainId = useChainId()
  const { address: userAddress } = useAccount()
  const connectedChainId = getSupportedChainId(chainId)
  const connectedV2Contracts = getV2Contracts(connectedChainId)
  const mainnetV2Contracts = getV2Contracts(56)
  const shouldFallbackToMainnet =
    !etfAddress &&
    (!connectedV2Contracts.featuredETFAddress || !connectedV2Contracts.factory || !connectedV2Contracts.router)
  const supportedChainId = shouldFallbackToMainnet ? 56 : connectedChainId
  const v2Contracts = shouldFallbackToMainnet ? mainnetV2Contracts : connectedV2Contracts
  const targetETF = etfAddress ?? v2Contracts.featuredETFAddress
  const hasETF = !!targetETF
  const etf = (targetETF ?? EMPTY_ADDRESS) as Address
  const factory = (v2Contracts.factory ?? EMPTY_ADDRESS) as Address
  const lens = (v2Contracts.lens ?? EMPTY_ADDRESS) as Address
  const hasLens = !!v2Contracts.lens && lens !== EMPTY_ADDRESS

  const { data: etfName } = useReadContract({
    address: etf,
    abi: blockETFV2CoreABI,
    functionName: 'name',
    query: { enabled: hasETF },
  })

  const { data: etfSymbol } = useReadContract({
    address: etf,
    abi: blockETFV2CoreABI,
    functionName: 'symbol',
    query: { enabled: hasETF },
  })

  const { data: assets } = useReadContract({
    address: lens,
    abi: blockETFV2LensABI,
    functionName: 'getAssets',
    args: [etf],
    query: { enabled: hasETF && hasLens },
  })

  const { data: totalValue } = useReadContract({
    address: lens,
    abi: blockETFV2LensABI,
    functionName: 'getTotalValue',
    args: [etf],
    query: { enabled: hasETF && hasLens },
  })

  const { data: shareValue } = useReadContract({
    address: lens,
    abi: blockETFV2LensABI,
    functionName: 'getShareValue',
    args: [etf],
    query: { enabled: hasETF && hasLens },
  })

  const { data: totalSupply } = useReadContract({
    address: etf,
    abi: blockETFV2CoreABI,
    functionName: 'totalSupply',
    query: { enabled: hasETF },
  })

  const { data: feeInfo } = useReadContract({
    address: lens,
    abi: blockETFV2LensABI,
    functionName: 'getFeeInfo',
    args: [etf],
    query: { enabled: hasETF && hasLens },
  })

  const { data: annualManagementFeeBps } = useReadContract({
    address: lens,
    abi: blockETFV2LensABI,
    functionName: 'getAnnualManagementFee',
    args: [etf],
    query: { enabled: hasETF && hasLens },
  })

  const { data: isPaused } = useReadContract({
    address: lens,
    abi: blockETFV2LensABI,
    functionName: 'isPaused',
    args: [etf],
    query: { enabled: hasETF && hasLens },
  })

  const { data: rebalanceInfo } = useReadContract({
    address: lens,
    abi: blockETFV2LensABI,
    functionName: 'getRebalanceInfo',
    args: [etf],
    query: { enabled: hasETF && hasLens },
  })

  const { data: etfLevel } = useReadContract({
    address: factory,
    abi: blockETFV2FactoryABI,
    functionName: 'etfLevel',
    args: [etf],
    query: { enabled: hasETF && !!v2Contracts.factory },
  })

  const { data: userShares } = useReadContract({
    address: etf,
    abi: blockETFV2CoreABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: hasETF && !!userAddress },
  })

  const assetAddresses = useMemo(
    () => assets?.map((asset) => asset.token as Address) ?? [],
    [assets]
  )

  const oracleAddress = (v2Contracts.priceOracle ?? EMPTY_ADDRESS) as Address

  const { data: prices } = useReadContract({
    address: oracleAddress,
    abi: priceOracleABI,
    functionName: 'getPrices',
    args: [assetAddresses],
    query: {
      enabled: hasETF && !!oracleAddress && oracleAddress !== EMPTY_ADDRESS && assetAddresses.length > 0,
    },
  })

  const symbolContracts = useMemo(
    () =>
      assetAddresses.map((address) => ({
        address,
        abi: erc20ABI,
        functionName: 'symbol' as const,
      })),
    [assetAddresses]
  )

  const decimalContracts = useMemo(
    () =>
      assetAddresses.map((address) => ({
        address,
        abi: erc20ABI,
        functionName: 'decimals' as const,
      })),
    [assetAddresses]
  )

  const vTokenContracts = useMemo(
    () =>
      (assets ?? [])
        .map((asset) => asset.vToken as Address)
        .map((address) => ({
          address,
          abi: vTokenABI,
          functionName: 'exchangeRateStored' as const,
        })),
    [assets]
  )

  const { data: symbolResults } = useReadContracts({
    contracts: symbolContracts,
    query: {
      enabled: assetAddresses.length > 0,
    },
  })

  const { data: decimalResults } = useReadContracts({
    contracts: decimalContracts,
    query: {
      enabled: assetAddresses.length > 0,
    },
  })

  const { data: exchangeRateResults } = useReadContracts({
    contracts: vTokenContracts,
    query: {
      enabled: (assets ?? []).length > 0,
    },
  })

  const portfolio = useMemo(() => {
    const currentWeights = rebalanceInfo?.[0] ?? []
    const targetWeights = rebalanceInfo?.[1] ?? []

    return (assets ?? []).map((asset, index) => {
      const price = prices?.[index]
      const symbol = (symbolResults?.[index]?.result as string | undefined) ?? `Asset ${index + 1}`
      const decimals = Number((decimalResults?.[index]?.result as number | bigint | undefined) ?? 18)
      const exchangeRate = asset.vToken !== EMPTY_ADDRESS
        ? (exchangeRateResults?.[index]?.result as bigint | undefined)
        : undefined
      const actualReserve =
        asset.vToken !== EMPTY_ADDRESS && exchangeRate
          ? (asset.reserve * exchangeRate) / 10n ** 18n
          : asset.reserve
      const weightedValue =
        totalValue && currentWeights[index] !== undefined
          ? (totalValue * (currentWeights[index] ?? 0n)) / 10_000n
          : undefined
      const priceBasedValue = price ? (actualReserve * price) / 10n ** BigInt(decimals) : undefined
      const value = weightedValue && weightedValue > 0n ? weightedValue : priceBasedValue

      return {
        ...asset,
        symbol,
        decimals,
        price,
        value,
        reserve: actualReserve,
        currentWeight: currentWeights[index] ?? 0n,
        targetWeight: targetWeights[index] ?? BigInt(asset.weight),
        venusEnabled: asset.vToken !== EMPTY_ADDRESS,
      }
    })
  }, [assets, decimalResults, exchangeRateResults, prices, rebalanceInfo, symbolResults, totalValue])

  const positionValue = useMemo(() => {
    if (!userShares || !shareValue) return undefined
    return (userShares * shareValue) / 10n ** 18n
  }, [shareValue, userShares])

  const mainnetFeaturedSnapshot = supportedChainId === 56 && sameAddress(targetETF, FEATURED_ETF_MAINNET)
  const fallbackPortfolio = mainnetFeaturedSnapshot ? MAINNET_SNAPSHOT_PORTFOLIO : []

  const explorerBaseUrl = getExplorerBaseUrl(supportedChainId)

  return {
    chainId: supportedChainId,
    explorerBaseUrl,
    etfAddress: targetETF,
    hasETF,
    hasLiveConfig: !!v2Contracts.factory && !!v2Contracts.router && !!v2Contracts.lens && !!targetETF,
    contracts: v2Contracts,
    etfName: etfName ?? (mainnetFeaturedSnapshot ? 'BlockETF TOP Index' : undefined),
    etfSymbol: etfSymbol ?? (mainnetFeaturedSnapshot ? 'TOP' : undefined),
    totalValue: totalValue ?? (mainnetFeaturedSnapshot ? INITIAL_MAINNET_TOTAL_VALUE : undefined),
    shareValue: shareValue ?? (mainnetFeaturedSnapshot ? INITIAL_MAINNET_SHARE_VALUE : undefined),
    totalSupply: totalSupply ?? (mainnetFeaturedSnapshot ? INITIAL_MAINNET_TOTAL_SUPPLY : undefined),
    feeInfo:
      feeInfo ??
      (mainnetFeaturedSnapshot
        ? {
            withdrawFee: 10,
            managementFeeRate: 0n,
            accumulatedFee: 0n,
            lastCollectTime: 0n,
          }
        : undefined),
    annualManagementFeeBps: annualManagementFeeBps ?? (mainnetFeaturedSnapshot ? 50n : undefined),
    isPaused: isPaused ?? false,
    needsRebalance: rebalanceInfo?.[2] ?? false,
    trustLevel: trustLevelLabel(etfLevel === undefined ? (mainnetFeaturedSnapshot ? 0 : undefined) : Number(etfLevel)),
    portfolio: portfolio.length > 0 ? portfolio : [...fallbackPortfolio],
    userShares,
    positionValue,
  }
}
