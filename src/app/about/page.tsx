import Link from 'next/link'
import { V2Header } from '@/components/v2/V2Header'

const composition = [
  { symbol: 'BTCB', weight: '25%', note: 'Core bitcoin exposure' },
  { symbol: 'ETH', weight: '25%', note: 'Core ethereum exposure' },
  { symbol: 'WBNB', weight: '14%', note: 'BNB Chain native beta' },
  { symbol: 'XRP', weight: '14%', note: 'Large-cap payments exposure' },
  { symbol: 'SOL', weight: '14%', note: 'High-beta smart contract exposure' },
  { symbol: 'USDT', weight: '8%', note: 'Stability and routing buffer' },
]

const principles = [
  {
    label: 'Structure',
    title: 'One token, six assets',
    body: 'TOP wraps a diversified basket into a single index token, so users do not need to build and maintain the basket manually.',
  },
  {
    label: 'Rebalancing',
    title: 'Automatic rebalancing',
    body: 'The protocol rebalances when weights drift too far from target allocation, keeping the portfolio aligned with the index design.',
  },
  {
    label: 'Yield',
    title: 'Yield-bearing reserves',
    body: 'Supported reserves can be supplied into Venus in the background, adding passive yield on idle capital inside the ETF structure.',
  },
]

const faq = [
  {
    q: 'What does BlockETF TOP Index represent?',
    a: 'Each TOP share represents proportional ownership of the ETF treasury, including the underlying crypto basket and the USDT buffer.',
  },
  {
    q: 'Why is there an 8% USDT allocation?',
    a: 'USDT acts as a reserve buffer. It makes routing and rebalancing more efficient and reduces the need to fully liquidate risk assets for every adjustment.',
  },
  {
    q: 'How does redeem work?',
    a: 'Redeeming burns your TOP shares and routes the underlying portfolio back into USDT through the Router. The final USDT amount depends on live pool prices and your slippage threshold.',
  },
  {
    q: 'Why can a transaction estimate sometimes change?',
    a: 'TOP trades rely on live DEX routing and current ETF treasury state. Quotes, gas estimates, and final outputs can move with pool conditions and onchain state between reads and execution.',
  },
]

function principleCardClass(index: number) {
  if (index === 0) {
    return 'rounded-[2rem] border border-sky-400/18 bg-[linear-gradient(180deg,rgba(14,34,55,0.92)_0%,rgba(8,18,30,0.95)_100%)] p-6 shadow-[0_24px_80px_rgba(4,9,19,0.22)]'
  }

  if (index === 1) {
    return 'rounded-[2rem] border border-violet-400/18 bg-[linear-gradient(180deg,rgba(30,18,54,0.9)_0%,rgba(13,10,24,0.95)_100%)] p-6 shadow-[0_24px_80px_rgba(4,9,19,0.22)]'
  }

  return 'rounded-[2rem] border border-emerald-400/18 bg-[linear-gradient(180deg,rgba(12,43,35,0.88)_0%,rgba(8,20,19,0.95)_100%)] p-6 shadow-[0_24px_80px_rgba(4,9,19,0.22)]'
}

export default function AboutPage() {
  return (
    <main className="atlas-shell min-h-screen text-[var(--atlas-text)]">
      <V2Header />

      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:gap-12 lg:py-16">
        <section className="overflow-hidden rounded-[2.8rem] border border-cyan-300/16 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(251,191,36,0.16),transparent_26%),linear-gradient(180deg,rgba(12,24,38,0.97)_0%,rgba(6,13,23,0.98)_100%)] p-8 shadow-[0_34px_110px_rgba(4,9,19,0.42)] sm:p-10">
          <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
            About BlockETF
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-[3.2rem] lg:text-[4rem]">
                A crypto index product built for long-term exposure on BNB Chain.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                BlockETF packages a rules-based onchain basket into a single token. The live flagship product,
                <span className="font-semibold text-white"> BlockETF TOP Index</span>, combines six core assets,
                automated rebalancing, and yield-bearing reserve management into one treasury structure.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center rounded-full border border-cyan-300/24 bg-cyan-300/10 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/14"
                >
                  Open App
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/8 bg-black/20 p-6 backdrop-blur-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Live Product Snapshot</div>
              <div className="mt-4 flex items-end gap-3">
                <div className="text-[2.1rem] font-semibold tracking-[-0.05em] text-white sm:text-[2.5rem]">
                  BlockETF TOP Index
                </div>
                <div className="inline-flex rounded-[1rem] border border-amber-300/24 bg-amber-300/12 px-3 py-1.5 text-xl font-semibold leading-none tracking-[-0.04em] text-amber-200">
                  TOP
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.35rem] border border-sky-400/18 bg-sky-500/10 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">Network</div>
                  <div className="mt-2 text-lg font-semibold text-white">BNB Smart Chain</div>
                </div>
                <div className="rounded-[1.35rem] border border-violet-400/18 bg-violet-500/10 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200">Basket Size</div>
                  <div className="mt-2 text-lg font-semibold text-white">6 assets</div>
                </div>
                <div className="rounded-[1.35rem] border border-emerald-400/18 bg-emerald-500/10 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200">Reserve Model</div>
                  <div className="mt-2 text-lg font-semibold text-white">Venus-enabled</div>
                </div>
                <div className="rounded-[1.35rem] border border-amber-400/18 bg-amber-500/10 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200">Index Style</div>
                  <div className="mt-2 text-lg font-semibold text-white">Core large-cap basket</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {principles.map((item, index) => (
            <div key={item.title} className={principleCardClass(index)}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{item.label}</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2.4rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,21,34,0.96)_0%,rgba(8,12,22,0.98)_100%)] p-7 shadow-[0_28px_90px_rgba(4,9,19,0.28)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Composition</div>
            <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-white">Current TOP Allocation</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              TOP is structured around two core anchors, three secondary growth assets, and a USDT reserve buffer for routing and stability.
            </p>

            <div className="mt-6 space-y-3">
              {composition.map((item) => (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between rounded-[1.35rem] border border-white/8 bg-white/4 px-4 py-4"
                >
                  <div>
                    <div className="text-lg font-semibold tracking-[-0.03em] text-white">{item.symbol}</div>
                    <div className="text-sm text-slate-400">{item.note}</div>
                  </div>
                  <div className="text-lg font-semibold text-cyan-200">{item.weight}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.4rem] border border-white/8 bg-[linear-gradient(180deg,rgba(17,19,35,0.96)_0%,rgba(8,10,20,0.98)_100%)] p-7 shadow-[0_28px_90px_rgba(4,9,19,0.28)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">How It Works</div>
            <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-white">From USDT in to USDT out</h2>

            <div className="mt-6 space-y-5">
              <div className="rounded-[1.5rem] border border-sky-400/16 bg-sky-500/8 p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">1. Invest</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Users deposit USDT through the Router. The protocol buys the underlying basket and mints TOP shares against the ETF treasury.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-violet-400/16 bg-violet-500/8 p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">2. Hold</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Treasury assets remain fully onchain. Supported reserves can be routed through Venus, while the index keeps target weights under rebalance rules.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-amber-400/16 bg-amber-500/8 p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">3. Redeem</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Users burn TOP shares to exit. The Router unwinds the basket back into USDT, subject to live routing conditions and the selected slippage threshold.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2.4rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,17,29,0.96)_0%,rgba(8,10,20,0.98)_100%)] p-7 shadow-[0_28px_90px_rgba(4,9,19,0.28)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">FAQ</div>
          <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-white">What users usually ask</h2>

          <div className="mt-6 space-y-4">
            {faq.map((item) => (
              <details key={item.q} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5">
                <summary className="cursor-pointer text-base font-semibold tracking-[-0.02em] text-white">
                  {item.q}
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
