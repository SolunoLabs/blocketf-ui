'use client'

import { useAccount, useChainId } from 'wagmi'
import { useUserTransactions } from '@/hooks/v2/useUserTransactions'
import type { Address } from '@/lib/contracts/addresses'

interface V2TransactionHistoryProps {
  etfAddress?: Address | null
  etfSymbol?: string
}

function formatDate(ts: number): string {
  const d = new Date(ts * 1000)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatUsd(v: number): string {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function V2TransactionHistory({ etfAddress, etfSymbol = 'TOP' }: V2TransactionHistoryProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { transactions, isLoading, hasMore, loadMore } = useUserTransactions(etfAddress)

  const explorerUrl = chainId === 56
    ? 'https://bscscan.com'
    : 'https://testnet.bscscan.com'

  if (!isConnected) return null

  if (isLoading) {
    return (
      <div className="rounded-[2.2rem] border border-white/8 bg-[#0C1824] p-6">
        <div className="h-[200px] animate-pulse rounded-xl bg-white/5" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-[2.2rem] border border-white/8 bg-[#0C1824] p-6 sm:p-7">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">History</div>
        <h3 className="mt-1.5 mb-4 text-xl font-semibold tracking-[-0.03em] text-white">Transactions</h3>
        <div className="flex h-[100px] items-center justify-center text-sm text-slate-500">
          No transactions yet.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[2.2rem] border border-white/8 bg-[#0C1824] p-6 sm:p-7">
      <div className="mb-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">History</div>
        <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-white">Transactions</h3>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4 text-right">Shares</th>
              <th className="pb-3 pr-4 text-right">USDT</th>
              <th className="pb-3 pr-4 text-right">Price</th>
              <th className="pb-3 pr-4 text-right">Fee</th>
              <th className="pb-3 text-right">Tx</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.txHash} className="border-b border-white/5 last:border-0">
                <td className="py-3 pr-4 text-slate-300">{formatDate(tx.timestamp)}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                      tx.type === 'Invest'
                        ? 'bg-[#5FAE8B]/15 text-[#5FAE8B]'
                        : 'bg-[#B96A6A]/15 text-[#B96A6A]'
                    }`}
                  >
                    {tx.type}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-white">
                  {tx.shares.toFixed(2)} {etfSymbol}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-white">{formatUsd(tx.usdtAmount)}</td>
                <td className="py-3 pr-4 text-right tabular-nums text-slate-300">{formatUsd(tx.shareValueAtTime)}</td>
                <td className="py-3 pr-4 text-right tabular-nums text-slate-400">
                  {tx.withdrawFeeShares > 0 ? formatUsd(tx.withdrawFeeShares * tx.shareValueAtTime) : '—'}
                </td>
                <td className="py-3 text-right">
                  <a
                    href={`${explorerUrl}/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7EC7C3]/70 transition hover:text-[#7EC7C3]"
                  >
                    ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {transactions.map((tx) => (
          <div
            key={tx.txHash}
            className="rounded-xl border border-white/6 bg-black/15 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                  tx.type === 'Invest'
                    ? 'bg-[#5FAE8B]/15 text-[#5FAE8B]'
                    : 'bg-[#B96A6A]/15 text-[#B96A6A]'
                }`}
              >
                {tx.type}
              </span>
              <span className="text-xs text-slate-500">{formatDate(tx.timestamp)}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-base font-semibold text-white">
                {tx.shares.toFixed(2)} {etfSymbol}
              </span>
              <span className="text-sm text-slate-300">{formatUsd(tx.usdtAmount)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>Price: {formatUsd(tx.shareValueAtTime)}</span>
              <div className="flex items-center gap-2">
                {tx.withdrawFeeShares > 0 && (
                  <span>Fee: {formatUsd(tx.withdrawFeeShares * tx.shareValueAtTime)}</span>
                )}
                <a
                  href={`${explorerUrl}/tx/${tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7EC7C3]/70 hover:text-[#7EC7C3]"
                >
                  ↗
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          className="mt-4 w-full rounded-xl border border-white/8 bg-white/5 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-white/8 hover:text-white"
        >
          Load more
        </button>
      )}
    </div>
  )
}
