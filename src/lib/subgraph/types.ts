export interface ETFSnapshotData {
  timestamp: number
  shareValue: number
  btcPrice: number
  ethPrice: number
}

export interface UserPositionData {
  sharesBalance: number
  totalInvested: number
  totalRedeemed: number
  avgCostPerShare: number
  costBasis: number
  realizedPnl: number
  totalWithdrawFeePaid: number
  mintCount: number
  burnCount: number
  currentShareValue: number
}

export interface UserSnapshotData {
  timestamp: number
  positionValue: number
  costBasis: number
  unrealizedPnl: number
}

export interface UserTransactionData {
  txHash: string
  timestamp: number
  type: 'Invest' | 'Redeem'
  shares: number
  usdtAmount: number
  usdtRefunded: number
  withdrawFeeShares: number
  shareValueAtTime: number
}
