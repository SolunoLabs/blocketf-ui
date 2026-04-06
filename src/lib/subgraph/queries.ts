import type { ETFSnapshotData, UserPositionData, UserSnapshotData, UserTransactionData } from './types'
import { normalizeSubgraphId, subgraphRequest } from './client'

interface SnapshotRow {
  hourStartTimestamp?: string
  dayStartTimestamp?: string
  shareValue: string
  btcPrice: string
  ethPrice: string
}

interface UserPositionRow {
  sharesBalance: string
  totalInvested: string
  totalRedeemed: string
  avgCostPerShare: string
  costBasis: string
  realizedPnl: string
  totalWithdrawFeePaid: string
  mintCount: string
  burnCount: string
  etf: {
    shareValue: string
  }
}

interface UserTransactionRow {
  txHash: string
  timestamp: string
  type: 'Invest' | 'Redeem'
  shares: string
  usdtAmount: string
  usdtRefunded: string
  withdrawFeeShares: string
  shareValueAtTime: string
}

interface UserSnapshotRow {
  timestamp: string
  positionValue: string
  costBasis: string
  unrealizedPnl: string
}

function parseNumber(value?: string | null) {
  return value ? Number(value) : 0
}

function dayStartTimestamp(timestamp: number) {
  return Math.floor(timestamp / 86400) * 86400
}

function mapSnapshotRow(row: SnapshotRow, timestampField: 'hourStartTimestamp' | 'dayStartTimestamp'): ETFSnapshotData {
  return {
    timestamp: parseNumber(row[timestampField]),
    shareValue: parseNumber(row.shareValue),
    btcPrice: parseNumber(row.btcPrice),
    ethPrice: parseNumber(row.ethPrice),
  }
}

export async function fetchETFPerformanceSeries(etfAddress: string) {
  const etf = normalizeSubgraphId(etfAddress)
  if (!etf) {
    return { hourly: [] as ETFSnapshotData[], daily: [] as ETFSnapshotData[] }
  }

  const query = `
    query ETFPerformanceSeries($etf: String!) {
      etfhourlySnapshots(first: 1000, orderBy: hourStartTimestamp, orderDirection: asc, where: { etf: $etf }) {
        hourStartTimestamp
        shareValue
        btcPrice
        ethPrice
      }
      etfdailySnapshots(first: 1000, orderBy: dayStartTimestamp, orderDirection: asc, where: { etf: $etf }) {
        dayStartTimestamp
        shareValue
        btcPrice
        ethPrice
      }
    }
  `

  const data = await subgraphRequest<{
    etfhourlySnapshots: SnapshotRow[]
    etfdailySnapshots: SnapshotRow[]
  }>(query, { etf })

  return {
    hourly: data.etfhourlySnapshots.map((row) => mapSnapshotRow(row, 'hourStartTimestamp')),
    daily: data.etfdailySnapshots.map((row) => mapSnapshotRow(row, 'dayStartTimestamp')),
  }
}

export async function fetchUserPosition(positionId: string): Promise<UserPositionData | null> {
  const id = normalizeSubgraphId(positionId)
  if (!id) return null

  const query = `
    query UserPosition($id: String!) {
      userPosition(id: $id) {
        sharesBalance
        totalInvested
        totalRedeemed
        avgCostPerShare
        costBasis
        realizedPnl
        totalWithdrawFeePaid
        mintCount
        burnCount
        etf {
          shareValue
        }
      }
    }
  `

  const data = await subgraphRequest<{ userPosition: UserPositionRow | null }>(query, { id })
  const position = data.userPosition
  if (!position) return null

  return {
    sharesBalance: parseNumber(position.sharesBalance),
    totalInvested: parseNumber(position.totalInvested),
    totalRedeemed: parseNumber(position.totalRedeemed),
    avgCostPerShare: parseNumber(position.avgCostPerShare),
    costBasis: parseNumber(position.costBasis),
    realizedPnl: parseNumber(position.realizedPnl),
    totalWithdrawFeePaid: parseNumber(position.totalWithdrawFeePaid),
    mintCount: parseNumber(position.mintCount),
    burnCount: parseNumber(position.burnCount),
    currentShareValue: parseNumber(position.etf.shareValue),
  }
}

export async function fetchUserTransactions(
  userAddress: string,
  etfAddress: string,
  first: number,
  skip: number
) {
  const user = normalizeSubgraphId(userAddress)
  const etf = normalizeSubgraphId(etfAddress)
  if (!user || !etf) {
    return { transactions: [] as UserTransactionData[], hasMore: false }
  }

  const query = `
    query UserTransactions($user: String!, $etf: String!, $first: Int!, $skip: Int!) {
      userTransactions(
        first: $first
        skip: $skip
        orderBy: timestamp
        orderDirection: desc
        where: { user: $user, etf: $etf }
      ) {
        txHash
        timestamp
        type
        shares
        usdtAmount
        usdtRefunded
        withdrawFeeShares
        shareValueAtTime
      }
    }
  `

  const data = await subgraphRequest<{ userTransactions: UserTransactionRow[] }>(query, {
    user,
    etf,
    first: first + 1,
    skip,
  })

  const rows = data.userTransactions
  return {
    transactions: rows.slice(0, first).map((row) => ({
      txHash: row.txHash,
      timestamp: parseNumber(row.timestamp),
      type: row.type,
      shares: parseNumber(row.shares),
      usdtAmount: parseNumber(row.usdtAmount),
      usdtRefunded: parseNumber(row.usdtRefunded),
      withdrawFeeShares: parseNumber(row.withdrawFeeShares),
      shareValueAtTime: parseNumber(row.shareValueAtTime),
    })),
    hasMore: rows.length > first,
  }
}

export async function fetchUserSnapshots(positionId: string): Promise<UserSnapshotData[]> {
  const position = normalizeSubgraphId(positionId)
  if (!position) return []

  const query = `
    query UserSnapshots($position: String!) {
      userSnapshots(
        first: 1000
        orderBy: timestamp
        orderDirection: asc
        where: { position: $position }
      ) {
        timestamp
        positionValue
        costBasis
        unrealizedPnl
      }
    }
  `

  const data = await subgraphRequest<{ userSnapshots: UserSnapshotRow[] }>(query, { position })

  return data.userSnapshots.map((snapshot) => ({
    timestamp: parseNumber(snapshot.timestamp),
    positionValue: parseNumber(snapshot.positionValue),
    costBasis: parseNumber(snapshot.costBasis),
    unrealizedPnl: parseNumber(snapshot.unrealizedPnl),
  }))
}

export async function fetchUserDailyYieldCurve(
  userAddress: string,
  etfAddress: string
): Promise<UserSnapshotData[]> {
  const user = normalizeSubgraphId(userAddress)
  const etf = normalizeSubgraphId(etfAddress)

  if (!user || !etf) return []

  const query = `
    query UserDailyYieldCurve($user: String!, $etf: String!) {
      userTransactions(
        first: 1000
        orderBy: timestamp
        orderDirection: asc
        where: { user: $user, etf: $etf }
      ) {
        timestamp
        type
        shares
        usdtAmount
      }
      etfdailySnapshots(
        first: 1000
        orderBy: dayStartTimestamp
        orderDirection: asc
        where: { etf: $etf }
      ) {
        dayStartTimestamp
        shareValue
        btcPrice
        ethPrice
      }
    }
  `

  const data = await subgraphRequest<{
    userTransactions: Array<Pick<UserTransactionRow, 'timestamp' | 'type' | 'shares' | 'usdtAmount'>>
    etfdailySnapshots: SnapshotRow[]
  }>(query, { user, etf })

  if (data.userTransactions.length === 0 || data.etfdailySnapshots.length === 0) {
    return []
  }

  const transactions = data.userTransactions.map((tx) => ({
    timestamp: parseNumber(tx.timestamp),
    type: tx.type,
    shares: parseNumber(tx.shares),
    usdtAmount: parseNumber(tx.usdtAmount),
  }))

  const dailySnapshots = data.etfdailySnapshots.map((snapshot) => ({
    timestamp: parseNumber(snapshot.dayStartTimestamp),
    shareValue: parseNumber(snapshot.shareValue),
  }))

  const startDay = dayStartTimestamp(
    Math.min(transactions[0].timestamp, dailySnapshots[0].timestamp)
  )
  const endDay = dayStartTimestamp(Math.floor(Date.now() / 1000))

  const result: UserSnapshotData[] = []
  let sharesBalance = 0
  let costBasis = 0
  let averageCost = 0
  let transactionIndex = 0
  let snapshotIndex = 0
  let currentShareValue = dailySnapshots[0].shareValue

  for (let day = startDay; day <= endDay; day += 86400) {
    const nextDay = day + 86400

    while (
      snapshotIndex < dailySnapshots.length - 1 &&
      dailySnapshots[snapshotIndex + 1].timestamp <= day
    ) {
      snapshotIndex++
      currentShareValue = dailySnapshots[snapshotIndex].shareValue
    }

    while (
      transactionIndex < transactions.length &&
      transactions[transactionIndex].timestamp < nextDay
    ) {
      const transaction = transactions[transactionIndex]

      if (transaction.type === 'Invest') {
        costBasis += transaction.usdtAmount
        sharesBalance += transaction.shares
        averageCost = sharesBalance > 0 ? costBasis / sharesBalance : 0
      } else {
        const redeemedCostBasis = transaction.shares * averageCost
        sharesBalance -= transaction.shares
        costBasis -= redeemedCostBasis
        sharesBalance = Math.max(sharesBalance, 0)
        costBasis = Math.max(costBasis, 0)
        averageCost = sharesBalance > 0 ? costBasis / sharesBalance : 0
      }

      transactionIndex++
    }

    if (transactionIndex === 0) {
      continue
    }

    const positionValue = sharesBalance * currentShareValue
    result.push({
      timestamp: day,
      positionValue,
      costBasis,
      unrealizedPnl: positionValue - costBasis,
    })
  }

  return result
}
