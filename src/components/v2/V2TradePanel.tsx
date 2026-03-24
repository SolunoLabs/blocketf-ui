'use client'

import { useState } from 'react'
import { formatUnits } from 'viem'
import { useAccount, useChainId } from 'wagmi'
import { Toast } from '@/components/Toast'
import { formatCurrency, formatTokenAmount } from '@/lib/format'
import { type Address } from '@/lib/contracts/addresses'
import { useBlockETFV2Trade, type V2TradeMode } from '@/hooks/v2/useBlockETFV2Trade'

interface V2TradePanelProps {
  etfAddress?: Address | null
  etfSymbol?: string
  paused?: boolean
}

export function V2TradePanel({ etfAddress, etfSymbol, paused }: V2TradePanelProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const [mode, setMode] = useState<V2TradeMode>('invest')
  const trade = useBlockETFV2Trade(etfAddress, mode)
  const symbol = etfSymbol ?? 'ETF'

  const previewLabel = mode === 'invest' ? 'Estimated shares' : 'Estimated USDT'
  const previewValue =
    mode === 'invest'
      ? `${formatTokenAmount(trade.investSharesQuote ?? 0n)} ${symbol}`
      : formatCurrency(trade.redeemUsdtQuote ?? 0n)

  const inputLabel = mode === 'invest' ? 'USDT amount' : `${symbol} shares`
  const balanceSuffix = mode === 'invest' ? 'USDT' : symbol
  const balanceValue =
    mode === 'invest'
      ? formatTokenAmount(trade.usdtBalance)
      : formatTokenAmount(trade.shareBalance)
  const maxAmount =
    mode === 'invest'
      ? formatUnits(trade.usdtBalance ?? 0n, 18)
      : formatUnits(trade.shareBalance ?? 0n, 18)
  const actionLabel = mode === 'invest' ? 'Invest with USDT' : 'Redeem to USDT'
  const theme =
    mode === 'invest'
      ? {
          accent: 'text-sky-300',
          border: 'border-sky-400/30',
          panel: 'from-sky-950/80 via-slate-950/90 to-cyan-950/70',
          inputBorder: 'border-sky-400/35 focus-within:border-sky-300/70',
          button: 'from-sky-500 via-blue-500 to-cyan-400',
          toggleActive: 'from-sky-500 to-cyan-400 text-slate-950 shadow-[0_18px_40px_rgba(56,189,248,0.3)]',
          preview: 'from-sky-500/14 to-cyan-400/8 border-sky-400/20',
          tag: 'bg-sky-400/12 text-sky-200 border-sky-300/20',
        }
      : {
          accent: 'text-fuchsia-300',
          border: 'border-fuchsia-400/30',
          panel: 'from-fuchsia-950/70 via-slate-950/90 to-violet-950/70',
          inputBorder: 'border-fuchsia-400/35 focus-within:border-fuchsia-300/70',
          button: 'from-fuchsia-500 via-violet-500 to-purple-400',
          toggleActive: 'from-fuchsia-500 to-violet-400 text-slate-950 shadow-[0_18px_40px_rgba(192,132,252,0.28)]',
          preview: 'from-fuchsia-500/14 to-violet-400/8 border-fuchsia-400/20',
          tag: 'bg-fuchsia-400/12 text-fuchsia-200 border-fuchsia-300/20',
        }

  return (
    <div className={`overflow-hidden rounded-[2.4rem] border bg-gradient-to-br ${theme.panel} p-6 shadow-[0_30px_90px_rgba(3,8,18,0.45)] sm:p-7 ${theme.border}`}>
      <Toast
        isOpen={trade.isSuccess || trade.isError}
        type={trade.isError ? 'error' : 'success'}
        message={
          trade.isError
            ? trade.error instanceof Error
              ? trade.error.message
              : 'Transaction failed'
            : trade.transactionKind === 'approve'
              ? 'Approval confirmed.'
              : 'Transaction confirmed.'
        }
        txHash={trade.pendingHash}
        chainId={chainId}
        onClose={() => {
          void trade.acknowledgeTransaction()
        }}
      />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${theme.accent}`}>Execution</div>
          <h3 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">Trade</h3>
        </div>
        <div className="grid w-full max-w-[18rem] grid-cols-2 gap-2 rounded-[1.4rem] border border-white/8 bg-white/5 p-2">
          {(['invest', 'redeem'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
                mode === value
                  ? `bg-gradient-to-r ${theme.toggleActive}`
                  : 'bg-transparent text-slate-300 hover:bg-white/6 hover:text-white'
              }`}
            >
              {value === 'invest' ? 'Invest' : 'Redeem'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className={`rounded-[2rem] border bg-black/20 p-5 backdrop-blur-sm ${theme.inputBorder}`}>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{inputLabel}</div>
            </div>
            <div className={`rounded-full border px-3 py-1.5 text-xs font-medium ${theme.tag}`}>
              Balance: {balanceValue} {balanceSuffix}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/30 px-5 py-4">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => trade.setAmount(maxAmount)}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:bg-white/8 ${theme.tag}`}
              >
                Max
              </button>
            </div>
            <input
              value={trade.amount}
              onChange={(event) => trade.setAmount(event.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-[2.2rem] font-semibold tracking-[-0.04em] text-white outline-none placeholder:text-white/18 sm:text-[2.5rem]"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
          <div className={`rounded-[1.8rem] border bg-gradient-to-br p-5 ${theme.preview}`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{previewLabel}</div>
            <div className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-white">{previewValue}</div>
          </div>
          <div className="rounded-[1.8rem] border border-white/8 bg-white/4 p-5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Slippage</div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${theme.tag}`}>
                {trade.slippage}%
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="10"
                value={trade.slippage}
                onChange={(event) => trade.setSlippage(Number(event.target.value))}
                className="w-full accent-[var(--atlas-cyan)]"
              />
            </div>
          </div>
        </div>

        {paused || !trade.hasTradeConfig ? (
          <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
            {paused
              ? 'This ETF is currently paused. Trading is disabled until the pause is lifted.'
              : 'Router or featured ETF address is not configured for this network yet.'}
          </div>
        ) : null}

        <div className="rounded-[2rem] border border-white/8 bg-black/20 p-3">
          {!isConnected ? (
            <div className="rounded-[1.4rem] border border-dashed border-white/10 px-4 py-5 text-center text-sm text-slate-400">
              Connect a wallet to use the V2 trade panel.
            </div>
          ) : trade.needsApproval ? (
            <button
              type="button"
              onClick={() => void trade.approve()}
              disabled={trade.isWriting || paused || trade.insufficientBalance}
              className="flex w-full flex-col items-center justify-center rounded-[1.4rem] border border-emerald-400/20 bg-gradient-to-r from-emerald-500/12 to-green-400/10 px-5 py-4 text-center transition duration-200 ease-out hover:-translate-y-0.5 hover:from-emerald-500/18 hover:to-green-400/14 hover:shadow-[0_18px_36px_rgba(16,185,129,0.18)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:transform-none"
            >
              <div className="text-base font-semibold text-emerald-50">
                {trade.isWriting ? 'Confirming approval...' : `Approve ${mode === 'invest' ? 'USDT' : symbol}`}
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void trade.submitTrade()}
              disabled={
                trade.isWriting ||
                trade.isQuoteLoading ||
                !trade.isQuoteReady ||
                paused ||
                !trade.hasTradeConfig ||
                trade.parsedAmount === 0n ||
                trade.insufficientBalance
              }
              className={`flex w-full items-center justify-center rounded-[1.4rem] bg-gradient-to-r px-5 py-4 text-center transition duration-200 ease-out hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none disabled:transform-none ${
                mode === 'invest'
                  ? `${theme.button} text-slate-950 shadow-[0_24px_44px_rgba(56,189,248,0.28)] hover:shadow-[0_28px_52px_rgba(56,189,248,0.34)]`
                  : `${theme.button} text-slate-950 shadow-[0_24px_44px_rgba(192,132,252,0.24)] hover:shadow-[0_28px_52px_rgba(192,132,252,0.32)]`
              }`}
            >
              <div className="text-base font-semibold tracking-[-0.01em] text-slate-950">
                {trade.isWriting
                  ? 'Confirming transaction...'
                  : trade.isQuoteLoading || !trade.isQuoteReady
                    ? 'Updating quote...'
                    : actionLabel}
              </div>
            </button>
          )}
        </div>

        {trade.parsedAmount > 0n && (trade.isQuoteLoading || !trade.isQuoteReady) ? (
          <div className="text-sm text-slate-400">Waiting for a fresh quote for the current input amount.</div>
        ) : null}

        {trade.insufficientBalance ? (
          <div className="text-sm text-[var(--atlas-error)]">Insufficient balance for this trade size.</div>
        ) : null}
      </div>
    </div>
  )
}
