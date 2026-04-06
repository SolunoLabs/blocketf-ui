'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { fetchUserDailyYieldCurve } from '@/lib/subgraph/queries'
import type { UserSnapshotData } from '@/lib/subgraph/types'

export function useUserYieldCurve(etfAddress?: string | null): {
  snapshots: UserSnapshotData[]
  isLoading: boolean
} {
  const { address } = useAccount()

  const snapshotsQuery = useQuery({
    queryKey: ['subgraph', 'user-daily-yield-curve', address?.toLowerCase(), etfAddress?.toLowerCase()],
    queryFn: () => fetchUserDailyYieldCurve(address!, etfAddress!),
    enabled: !!address && !!etfAddress,
    staleTime: 30_000,
  })

  return {
    snapshots: snapshotsQuery.data ?? [],
    isLoading: snapshotsQuery.isLoading,
  }
}
