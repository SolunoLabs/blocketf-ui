'use client'

import { useChainId } from 'wagmi'
import { getV2Contracts } from '@/lib/contracts/addresses'
import { useBlockETFV2ETF } from './useBlockETFV2ETF'

export function useFeaturedETF() {
  const chainId = useChainId()
  const featuredETFAddress = getV2Contracts(chainId).featuredETFAddress
  return useBlockETFV2ETF(featuredETFAddress)
}
