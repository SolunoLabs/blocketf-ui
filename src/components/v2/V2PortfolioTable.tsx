import { formatCompactCurrency, formatTokenAmount, formatWeight, shortAddress } from '@/lib/format'

interface PortfolioAsset {
  token: string
  symbol: string
  reserve: bigint
  decimals?: number
  value?: bigint
  currentWeight: bigint
  targetWeight: bigint
  venusEnabled: boolean
}

export function V2PortfolioTable({ assets }: { assets: PortfolioAsset[] }) {
  return (
    <div className="overflow-hidden rounded-[2.4rem] border border-violet-300/16 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_24%),radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_20%),linear-gradient(180deg,rgba(10,17,29,0.98)_0%,rgba(5,11,18,1)_100%)] shadow-[0_26px_80px_rgba(4,9,19,0.34)]">
      <div className="border-b border-white/8 px-6 py-6 sm:px-7">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-200">Allocation</div>
          <h3 className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-white">Portfolio Composition</h3>
          <p className="mt-1 max-w-2xl text-sm leading-7 text-slate-300">
            Current and target weights are shown side by side so rebalance pressure is visible.
          </p>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 md:hidden sm:px-7">
        {assets.map((asset) => (
          <article key={asset.token} className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold tracking-[-0.02em] text-white">{asset.symbol}</div>
                <div className="mt-1 text-xs text-slate-500">{shortAddress(asset.token)}</div>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  asset.venusEnabled
                    ? 'border border-emerald-300/18 bg-emerald-400/12 text-emerald-200'
                    : 'border border-white/8 bg-white/8 text-slate-400'
                }`}
              >
                {asset.venusEnabled ? 'Venus enabled' : 'Spot reserve'}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MobileMetric label="Reserve" value={formatTokenAmount(asset.reserve, asset.decimals ?? 18)} />
              <MobileMetric label="Value" value={formatCompactCurrency(asset.value)} />
              <MobileMetric label="Current" value={formatWeight(asset.currentWeight)} />
              <MobileMetric label="Target" value={formatWeight(asset.targetWeight)} />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden px-6 py-6 md:block sm:px-7">
        <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-black/16">
        <table className="min-w-full divide-y divide-white/8 text-left">
          <thead className="bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)] text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="px-4 py-4">Asset</th>
              <th className="px-4 py-4">Reserve</th>
              <th className="px-4 py-4">Current</th>
              <th className="px-4 py-4">Target</th>
              <th className="px-4 py-4">Value</th>
              <th className="px-4 py-4">Yield</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8 text-sm text-slate-300">
            {assets.map((asset) => (
              <tr key={asset.token} className="bg-white/[0.02] transition hover:bg-[linear-gradient(90deg,rgba(139,92,246,0.08)_0%,rgba(56,189,248,0.03)_100%)]">
                <td className="px-4 py-4">
                  <div className="font-semibold tracking-[-0.02em] text-white">{asset.symbol}</div>
                  <div className="mt-1 text-xs text-slate-500">{shortAddress(asset.token)}</div>
                </td>
                <td className="px-4 py-4">{formatTokenAmount(asset.reserve, asset.decimals ?? 18)}</td>
                <td className="px-4 py-4">
                  <span className="inline-flex rounded-full bg-white/6 px-3 py-1 font-medium text-white">
                    {formatWeight(asset.currentWeight)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex rounded-full bg-violet-400/12 px-3 py-1 font-medium text-violet-200">
                    {formatWeight(asset.targetWeight)}
                  </span>
                </td>
                <td className="px-4 py-4">{formatCompactCurrency(asset.value)}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      asset.venusEnabled
                        ? 'border border-emerald-300/18 bg-emerald-400/12 text-emerald-200'
                        : 'border border-white/8 bg-white/8 text-slate-400'
                    }`}
                  >
                    {asset.venusEnabled ? 'Venus enabled' : 'Spot reserve'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

    </div>
  )
}

function MobileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/8 bg-black/20 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  )
}
