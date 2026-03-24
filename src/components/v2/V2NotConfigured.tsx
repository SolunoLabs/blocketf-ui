import Link from 'next/link'
import { V2_APP_CONFIG, V2_FALLBACK_CONTENT } from '@/lib/contracts/config'

export function V2NotConfigured() {
  return (
    <section className="atlas-panel rounded-[2.2rem] p-8">
      <div className="mb-4 inline-flex rounded-full border border-[rgba(198,165,107,0.24)] bg-[rgba(198,165,107,0.1)] px-3 py-1 text-[11px] atlas-kicker text-[var(--atlas-brass)]">
        {V2_FALLBACK_CONTENT.statusLabel}
      </div>
      <h2 className="atlas-title max-w-3xl text-3xl font-semibold text-[var(--atlas-text)]">
        {V2_FALLBACK_CONTENT.statusDescription}
      </h2>
      <div className="mt-6 grid gap-3 text-sm text-[var(--atlas-text-muted)] md:grid-cols-3">
        {V2_FALLBACK_CONTENT.implementationNotes.map((item) => (
          <div key={item} className="atlas-subtle-panel rounded-[1.6rem] p-4">
            {item}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={V2_APP_CONFIG.legacyRoute}
          className="atlas-secondary-button rounded-full px-5 py-3 text-sm font-medium transition hover:border-[rgba(126,199,195,0.35)]"
        >
          Open V1 legacy app
        </Link>
        <div className="rounded-full border border-[rgba(198,165,107,0.22)] bg-[rgba(198,165,107,0.08)] px-5 py-3 text-sm font-medium text-[var(--atlas-brass)]">
          Update V2 deployment variables in `.env.local`
        </div>
      </div>
    </section>
  )
}
