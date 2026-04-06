'use client'

import { useAccount } from 'wagmi'
import { useUserPosition } from '@/hooks/v2/useUserPosition'
import type { Address } from '@/lib/contracts/addresses'

interface V2PositionSummaryProps {
  etfAddress?: Address | null
  etfSymbol?: string
}

function formatUsd(v: number): string {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatPnl(v: number): string {
  const sign = v >= 0 ? '+' : ''
  return sign + formatUsd(v)
}

function formatPct(v: number): string {
  const sign = v >= 0 ? '+' : ''
  return sign + v.toFixed(2) + '%'
}

export function V2PositionSummary({ etfAddress, etfSymbol = 'TOP' }: V2PositionSummaryProps) {
  const { isConnected } = useAccount()
  const { position, isLoading } = useUserPosition(etfAddress)

  if (!isConnected) {
    return (
      <div className="rounded-[2.2rem] border border-dashed border-white/10 bg-[#0C1824]/50 p-8 text-center">
        <div className="text-sm text-slate-500">Connect wallet to view your position.</div>
      </div>
    )
  }

  if (isLoading || !position) {
    return (
      <div className="rounded-[2.2rem] border border-white/8 bg-[#0C1824] p-6">
        <div className="h-[160px] animate-pulse rounded-xl bg-white/5" />
      </div>
    )
  }

  const currentValue = position.sharesBalance * position.currentShareValue
  const unrealizedPnl = currentValue - position.costBasis
  const unrealizedPct = position.costBasis > 0 ? (unrealizedPnl / position.costBasis) * 100 : 0
  const pnlColor = unrealizedPnl >= 0 ? 'text-[#5FAE8B]' : 'text-[#B96A6A]'
  const realizedColor = position.realizedPnl >= 0 ? 'text-[#5FAE8B]' : 'text-[#B96A6A]'

  return (
    <div className="rounded-[2.2rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-950/40 via-[#0C1824] to-teal-950/30 p-6 sm:p-7">
      {/* Header */}
      <div className="mb-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
          Personal
        </div>
        <h3 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-white">
          My Position
        </h3>
      </div>

      {/* Primary metrics */}
      <div className="mb-5 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/8 bg-black/20 px-5 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Holdings</div>
          <div className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">
            {position.sharesBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            <span className="ml-1.5 text-sm font-medium text-slate-400">{etfSymbol}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/20 px-5 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Current Value</div>
          <div className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">
            {formatUsd(currentValue)}
          </div>
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/6 bg-black/15 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Unrealized P&L</div>
          <div className={`mt-1.5 text-base font-semibold ${pnlColor}`}>
            {formatPnl(unrealizedPnl)}
          </div>
          <div className={`text-xs ${pnlColor}`}>{formatPct(unrealizedPct)}</div>
        </div>
        <div className="rounded-xl border border-white/6 bg-black/15 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Realized P&L</div>
          <div className={`mt-1.5 text-base font-semibold ${realizedColor}`}>
            {formatPnl(position.realizedPnl)}
          </div>
        </div>
        <div className="rounded-xl border border-white/6 bg-black/15 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Price Now</div>
          <div className="mt-1.5 text-base font-semibold text-white">
            {formatUsd(position.currentShareValue)}
          </div>
        </div>
        <div className="rounded-xl border border-white/6 bg-black/15 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Avg Cost</div>
          <div className="mt-1.5 text-base font-semibold text-white">
            {formatUsd(position.avgCostPerShare)}
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
        <span>Fees paid: {formatUsd(position.totalWithdrawFeePaid)}</span>
        <span>{position.mintCount} buy{position.mintCount !== 1 ? 's' : ''}</span>
        <span>{position.burnCount} redeem{position.burnCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}
