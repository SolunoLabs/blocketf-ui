function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.19-.02-2.15-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.69.08-.69 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.69 1.25 3.35.95.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.3 1.19-3.11-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.2 1.19a11.1 11.1 0 0 1 5.82 0c2.22-1.5 3.2-1.19 3.2-1.19.63 1.59.23 2.77.11 3.06.74.81 1.19 1.85 1.19 3.11 0 4.43-2.68 5.4-5.24 5.69.41.36.78 1.08.78 2.18 0 1.57-.01 2.84-.01 3.23 0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.26l-4.9-7.41L5.56 22H2.45l7.24-8.27L1.5 2h6.42l4.43 6.76L18.9 2Zm-1.1 18h1.72L6.97 3.9H5.12L17.8 20Z" />
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 pt-8 text-center">
      <div className="flex items-center justify-center gap-4">
        <a
          href="https://github.com/SolunoLabs"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          aria-label="BlockETF GitHub"
        >
          <GitHubIcon />
        </a>
        <a
          href="https://x.com/solunolab"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          aria-label="BlockETF on X"
        >
          <XIcon />
        </a>
      </div>
      <div className="mt-5 space-y-2 text-sm text-slate-400">
        <p>BlockETF - Decentralized ETF Platform | Built on BSC</p>
        <p>© 2026 Keegan Soluno Lab. All rights reserved.</p>
      </div>
    </footer>
  )
}
