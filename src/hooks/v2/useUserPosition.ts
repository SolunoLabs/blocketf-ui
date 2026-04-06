'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { fetchUserPosition } from '@/lib/subgraph/queries'
import type { UserPositionData } from '@/lib/subgraph/types'

function getPositionId(userAddress?: string | null, etfAddress?: string | null) {
  if (!userAddress || !etfAddress) return null
  return `${userAddress.toLowerCase()}-${etfAddress.toLowerCase()}`
}

export function useUserPosition(etfAddress?: string | null): {
  position: UserPositionData | null
  isLoading: boolean
} {
  const { address } = useAccount()
  const positionId = getPositionId(address, etfAddress)

  const positionQuery = useQuery({
    queryKey: ['subgraph', 'user-position', positionId],
    queryFn: () => fetchUserPosition(positionId!),
    enabled: !!positionId,
    staleTime: 30_000,
  })

  return {
    position: positionQuery.data ?? null,
    isLoading: positionQuery.isLoading,
  }
}
