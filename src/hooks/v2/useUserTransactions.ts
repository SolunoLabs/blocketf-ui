'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { fetchUserTransactions } from '@/lib/subgraph/queries'
import type { UserTransactionData } from '@/lib/subgraph/types'

const PAGE_SIZE = 10

export function useUserTransactions(etfAddress?: string | null): {
  transactions: UserTransactionData[]
  isLoading: boolean
  hasMore: boolean
  loadMore: () => void
} {
  const { address } = useAccount()

  const transactionsQuery = useInfiniteQuery({
    queryKey: ['subgraph', 'user-transactions', address?.toLowerCase(), etfAddress?.toLowerCase()],
    queryFn: ({ pageParam }) => fetchUserTransactions(address!, etfAddress!, PAGE_SIZE, pageParam),
    enabled: !!address && !!etfAddress,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length * PAGE_SIZE : undefined,
    staleTime: 30_000,
  })

  return {
    transactions: transactionsQuery.data?.pages.flatMap((page) => page.transactions) ?? [],
    isLoading: transactionsQuery.isLoading,
    hasMore: transactionsQuery.hasNextPage ?? false,
    loadMore: () => void transactionsQuery.fetchNextPage(),
  }
}
