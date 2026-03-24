'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBlockETFV2ETF } from '@/hooks/v2/useBlockETFV2ETF'
import { V2_APP_CONFIG } from '@/lib/contracts/config'
import { formatBps, formatCompactCurrency, formatCurrency, formatTokenAmount, shortAddress } from '@/lib/format'
import { type Address } from '@/lib/contracts/addresses'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { V2NotConfigured } from './V2NotConfigured'
import { V2TradePanel } from './V2TradePanel'
import { V2PortfolioTable } from './V2PortfolioTable'
import { V2PositionCard } from './V2PositionCard'

interface ETFDetailPageProps {
  etfAddress?: Address | null
  featured?: boolean
}

export function ETFDetailPage({ etfAddress, featured = false }: ETFDetailPageProps) {
  const [hydrated, setHydrated] = useState(false)
  const etf = useBlockETFV2ETF(etfAddress)

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) {
    return (
      <main className="atlas-shell min-h-screen text-[var(--atlas-text)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:gap-12 lg:py-16">
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex h-full flex-col justify-between overflow-hidden rounded-[2.6rem] border border-cyan-300/16 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_85%_16%,rgba(216,180,112,0.18),transparent_28%),linear-gradient(180deg,rgba(12,24,38,0.96)_0%,rgba(6,13,23,0.98)_100%)] p-8 shadow-[0_34px_110px_rgba(4,9,19,0.4)] sm:p-10">
              <div className="mb-6 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                {featured ? 'Featured ETF' : 'ETF Detail'}
              </div>
              <div>
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-5xl lg:text-[3.6rem]">
                  {V2_APP_CONFIG.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  {V2_APP_CONFIG.description}
                </p>
              </div>
            </div>
            <div className="h-full rounded-[2.4rem] border border-white/8 bg-black/20 p-6 backdrop-blur-sm sm:p-7">
              <div className="text-sm text-slate-400">Loading ETF state...</div>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="atlas-shell min-h-screen text-[var(--atlas-text)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:gap-12 lg:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex h-full flex-col justify-between overflow-hidden rounded-[2.6rem] border border-cyan-300/16 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_34%),radial-gradient(circle_at_85%_16%,rgba(216,180,112,0.18),transparent_28%),linear-gradient(180deg,rgba(12,24,38,0.96)_0%,rgba(6,13,23,0.98)_100%)] p-8 shadow-[0_34px_110px_rgba(4,9,19,0.4)] sm:p-10">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                {featured ? 'Featured ETF' : 'ETF Detail'}
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <h1 className="max-w-3xl text-[2.2rem] font-semibold leading-tight tracking-[-0.05em] text-white sm:text-[2.45rem] lg:text-[2.8rem]">
                  {etf.etfName ?? V2_APP_CONFIG.title}
                </h1>
                <div className="inline-flex rounded-[1.2rem] border border-amber-300/24 bg-amber-300/12 px-4 py-2 text-[1.7rem] font-semibold leading-none tracking-[-0.04em] text-amber-200 sm:text-[1.9rem] lg:text-[2.15rem]">
                  {etf.etfSymbol ?? 'TOP'}
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  {V2_APP_CONFIG.description}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <MetricCard label="Share price" value={formatCurrency(etf.shareValue)} tone="sky" />
                <MetricCard label="TVL" value={formatCompactCurrency(etf.totalValue)} tone="violet" />
                <MetricCard label="Supply" value={formatTokenAmount(etf.totalSupply)} tone="emerald" />
              </div>
            </div>

            <div className="mt-8 space-y-8">
              <div className="flex flex-wrap gap-3">
                <StatePill label={etf.isPaused ? 'Paused' : 'Active'} tone={etf.isPaused ? 'rose' : 'emerald'} />
                <StatePill
                  label={etf.needsRebalance ? 'Rebalance needed' : 'Weights aligned'}
                  tone={etf.needsRebalance ? 'amber' : 'sky'}
                />
                <StatePill
                  label={`${etf.portfolio.filter((asset) => asset.venusEnabled).length} yield-enabled assets`}
                  tone="slate"
                />
              </div>

              <div className="grid gap-4 text-sm md:grid-cols-3">
                <InfoCard
                  label="ETF address"
                  value={shortAddress(etf.etfAddress)}
                  href={etf.etfAddress ? `${etf.explorerBaseUrl}/address/${etf.etfAddress}` : undefined}
                />
                <InfoCard label="Annual management fee" value={formatBps(etf.annualManagementFeeBps)} />
                <InfoCard label="Redemption fee" value={formatBps(etf.feeInfo?.withdrawFee)} />
              </div>
            </div>
          </div>

          <V2TradePanel
            etfAddress={etf.etfAddress}
            etfSymbol={etf.etfSymbol}
            shareValue={etf.shareValue}
            paused={etf.isPaused}
          />
        </section>

        {!etf.hasLiveConfig ? <V2NotConfigured /> : null}

        <V2PortfolioTable assets={etf.portfolio} />

        <V2PositionCard
          userShares={etf.userShares}
          positionValue={etf.positionValue}
          totalSupply={etf.totalSupply}
        />

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/8 bg-white/4 p-6 text-sm text-slate-300 backdrop-blur-sm">
          <div>
            V1 remains available during migration. Keep it accessible for existing users, but route new usage to V2.
          </div>
          <Link href="/v1" className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-white transition hover:border-cyan-300/35 hover:bg-cyan-300/8">
            Open V1 legacy
          </Link>
        </section>

        <SiteFooter />
      </div>
    </main>
  )
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'sky' | 'violet' | 'emerald' | 'amber'
}) {
  const tones = {
    sky: 'from-sky-500/16 to-cyan-400/8 border-sky-400/22',
    violet: 'from-violet-500/16 to-fuchsia-400/8 border-violet-400/22',
    emerald: 'from-emerald-500/16 to-teal-400/8 border-emerald-400/22',
    amber: 'from-amber-500/16 to-orange-400/8 border-amber-400/22',
  }

  return (
    <div className={`rounded-[1.7rem] border bg-gradient-to-br p-5 ${tones[tone]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-3 text-[1.95rem] font-semibold tracking-[-0.04em] text-white">{value}</div>
    </div>
  )
}

function StatePill({
  label,
  tone,
}: {
  label: string
  tone: 'emerald' | 'amber' | 'rose' | 'sky' | 'slate'
}) {
  const classes = {
    emerald: 'bg-[rgba(95,174,139,0.14)] text-[var(--atlas-success)]',
    amber: 'bg-[rgba(201,161,93,0.14)] text-[var(--atlas-warning)]',
    rose: 'bg-[rgba(185,106,106,0.14)] text-[var(--atlas-error)]',
    sky: 'bg-[rgba(126,199,195,0.14)] text-[var(--atlas-cyan)]',
    slate: 'bg-[rgba(200,210,220,0.08)] text-[var(--atlas-text-muted)]',
  }

  return <div className={`rounded-full px-4 py-2 text-sm ${classes[tone]}`}>{label}</div>
}

function InfoCard({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/8 bg-black/16 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex font-medium text-white transition hover:text-cyan-300 hover:underline"
        >
          {value}
        </a>
      ) : (
        <div className="mt-2 font-medium text-white">{value}</div>
      )}
    </div>
  )
}
