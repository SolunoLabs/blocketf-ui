import { formatCompactCurrency, formatTokenAmount } from '@/lib/format'

interface V2PositionCardProps {
  userShares?: bigint
  positionValue?: bigint
  totalSupply?: bigint
}

export function V2PositionCard({ userShares, positionValue, totalSupply }: V2PositionCardProps) {
  const ownership =
    userShares && totalSupply && totalSupply > 0n ? Number((userShares * 10_000n) / totalSupply) / 100 : 0

  return (
    <div className="overflow-hidden rounded-[2.2rem] border border-emerald-300/14 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_26%),linear-gradient(180deg,rgba(8,18,24,0.95)_0%,rgba(5,11,18,0.98)_100%)] p-6 shadow-[0_26px_80px_rgba(4,9,19,0.34)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200">Personal State</div>
      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">My Position</h3>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricBlock label="Shares" value={formatTokenAmount(userShares)} />
        <MetricBlock label="Current value" value={formatCompactCurrency(positionValue)} />
        <MetricBlock label="Ownership" value={`${ownership.toFixed(2)}%`} />
      </div>
    </div>
  )
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/8 bg-white/4 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{value}</div>
    </div>
  )
}
