'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { V2_APP_CONFIG } from '@/lib/contracts/config'

export function V2Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(7,17,29,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1.15rem] shadow-[0_14px_36px_rgba(7,17,29,0.34)]">
              <Image src="/blocketf-mark-mono.svg" alt="BlockETF" width={44} height={44} priority />
            </div>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="truncate text-[1.05rem] font-semibold tracking-[-0.04em] text-white sm:text-[1.25rem]">
                BlockETF
              </div>
              <div className="inline-flex rounded-[0.85rem] border border-amber-300/24 bg-amber-300/12 px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-amber-200">
                V2
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/about" className="transition hover:text-white">
              About
            </Link>
            {V2_APP_CONFIG.legacyV1Enabled ? (
              <Link href={V2_APP_CONFIG.legacyRoute} className="transition hover:text-white">
                V1 Legacy
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-amber-100 md:inline-flex">
              BNB Chain
            </div>
            <ConnectButton />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/8 pt-3 md:hidden">
          <nav className="flex items-center gap-2 text-[0.78rem] font-medium text-slate-300">
            <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-white/20 hover:text-white">
              Home
            </Link>
            <Link href="/about" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-white/20 hover:text-white">
              About
            </Link>
            {V2_APP_CONFIG.legacyV1Enabled ? (
              <Link
                href={V2_APP_CONFIG.legacyRoute}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-white/20 hover:text-white"
              >
                V1
              </Link>
            ) : null}
          </nav>
          <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-amber-100">
            BNB Chain
          </div>
        </div>
      </div>
    </header>
  )
}
