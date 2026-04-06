'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchETFPerformanceSeries } from '@/lib/subgraph/queries'
import type { ETFSnapshotData } from '@/lib/subgraph/types'

export type TimeRange = '1W' | '1M' | '3M' | 'ALL'

const HOUR = 3600
const DAY = 86400

function interpolate(snapshots: ETFSnapshotData[], intervalSeconds: number): ETFSnapshotData[] {
  if (snapshots.length < 2) return snapshots

  const result: ETFSnapshotData[] = []
  const start = snapshots[0].timestamp
  const end = snapshots[snapshots.length - 1].timestamp
  let sourceIndex = 0

  for (let timestamp = start; timestamp <= end; timestamp += intervalSeconds) {
    while (
      sourceIndex < snapshots.length - 1 &&
      snapshots[sourceIndex + 1].timestamp <= timestamp
    ) {
      sourceIndex++
    }

    result.push({
      ...snapshots[sourceIndex],
      timestamp,
    })
  }

  return result
}

export function useETFPerformance(etfAddress?: string | null, timeRange: TimeRange = 'ALL') {
  const performanceQuery = useQuery({
    queryKey: ['subgraph', 'etf-performance', etfAddress?.toLowerCase()],
    queryFn: () => fetchETFPerformanceSeries(etfAddress!),
    enabled: !!etfAddress,
    staleTime: 60_000,
  })

  const data = useMemo(() => {
    const now = Math.floor(Date.now() / 1000)
    const hourly = performanceQuery.data?.hourly ?? []
    const daily = performanceQuery.data?.daily ?? []

    const config: Record<TimeRange, { source: ETFSnapshotData[]; since: number; interval: number }> = {
      '1W': { source: hourly, since: now - 7 * DAY, interval: HOUR },
      '1M': { source: hourly, since: now - 30 * DAY, interval: HOUR * 4 },
      '3M': { source: daily, since: now - 90 * DAY, interval: DAY },
      'ALL': { source: daily, since: 0, interval: DAY },
    }

    const { source, since, interval } = config[timeRange]
    const filtered = source.filter((snapshot) => snapshot.timestamp >= since)

    return interpolate(filtered, interval)
  }, [performanceQuery.data, timeRange])

  const normalized = useMemo(() => {
    if (data.length === 0) return []

    const first = data[0]
    return data.map((snapshot) => ({
      timestamp: snapshot.timestamp,
      etf: ((snapshot.shareValue - first.shareValue) / first.shareValue) * 100,
      btc: ((snapshot.btcPrice - first.btcPrice) / first.btcPrice) * 100,
      eth: ((snapshot.ethPrice - first.ethPrice) / first.ethPrice) * 100,
    }))
  }, [data])

  return {
    snapshots: data,
    normalized,
    isLoading: performanceQuery.isLoading,
    error: performanceQuery.error instanceof Error ? performanceQuery.error.message : null,
  }
}
