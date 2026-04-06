'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, LineSeries, type IChartApi, type ISeriesApi, type LineData, type Time, ColorType, LineStyle } from 'lightweight-charts'
import { useETFPerformance, type TimeRange } from '@/hooks/v2/useETFPerformance'

interface V2PerformanceChartProps {
  etfAddress?: string | null
  etfSymbol?: string
}

const TIME_RANGES: TimeRange[] = ['1W', '1M', '3M', 'ALL']

const COLORS = {
  etf: '#7EC7C3',
  btc: '#C6A56B',
  eth: '#A78BFA',
  grid: 'rgba(255,255,255,0.04)',
  text: '#7C8B99',
  crosshair: 'rgba(126,199,195,0.3)',
}

export function V2PerformanceChart({ etfAddress, etfSymbol = 'ETF' }: V2PerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL')
  const { normalized, isLoading, error } = useETFPerformance(etfAddress, timeRange)
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRefs = useRef<{ etf: ISeriesApi<'Line'> | null; btc: ISeriesApi<'Line'> | null; eth: ISeriesApi<'Line'> | null }>({ etf: null, btc: null, eth: null })

  useEffect(() => {
    if (!containerRef.current || normalized.length === 0) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: COLORS.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: COLORS.grid },
        horzLines: { color: COLORS.grid },
      },
      crosshair: {
        vertLine: { color: COLORS.crosshair, labelBackgroundColor: '#101C2A' },
        horzLine: { color: COLORS.crosshair, labelBackgroundColor: '#101C2A' },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
      },
      handleScale: false,
      handleScroll: false,
    })

    const etfSeries = chart.addSeries(LineSeries, {
      color: COLORS.etf,
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: { type: 'custom', formatter: (v: number) => v.toFixed(1) + '%' },
    })
    const btcSeries = chart.addSeries(LineSeries, {
      color: COLORS.btc,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: { type: 'custom', formatter: (v: number) => v.toFixed(1) + '%' },
    })
    const ethSeries = chart.addSeries(LineSeries, {
      color: COLORS.eth,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: { type: 'custom', formatter: (v: number) => v.toFixed(1) + '%' },
    })

    chartRef.current = chart
    seriesRefs.current = { etf: etfSeries, btc: btcSeries, eth: ethSeries }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width, height: 280 })
      }
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRefs.current = { etf: null, btc: null, eth: null }
    }
  }, [normalized.length])

  useEffect(() => {
    const { etf, btc, eth } = seriesRefs.current
    if (!etf || !btc || !eth || normalized.length === 0) return

    const toLineData = (points: typeof normalized, key: 'etf' | 'btc' | 'eth'): LineData[] =>
      points.map((p) => ({ time: p.timestamp as Time, value: p[key] }))

    etf.setData(toLineData(normalized, 'etf'))
    btc.setData(toLineData(normalized, 'btc'))
    eth.setData(toLineData(normalized, 'eth'))

    chartRef.current?.timeScale().fitContent()
  }, [normalized])

  if (isLoading) {
    return (
      <div className="rounded-[2.2rem] border border-white/8 bg-[#0C1824] p-6 sm:p-7">
        <div className="h-[340px] animate-pulse rounded-xl bg-white/5" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[2.2rem] border border-white/8 bg-[#0C1824] p-6 sm:p-7">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7EC7C3]">
          Performance
        </div>
        <div className="flex h-[280px] items-center justify-center text-center text-sm text-slate-400">
          Failed to load benchmark snapshots: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[2.2rem] border border-white/8 bg-[#0C1824] p-6 sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7EC7C3]">
            Performance
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
            {etfSymbol} vs Benchmarks
          </h3>
        </div>
        <div className="flex gap-1 rounded-xl border border-white/8 bg-white/5 p-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                timeRange === range
                  ? 'bg-[#7EC7C3]/20 text-[#7EC7C3]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {normalized.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
          Performance data will appear after the first few transactions.
        </div>
      ) : (
        <div ref={containerRef} className="h-[280px]" />
      )}

      <div className="mt-4 flex gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 rounded" style={{ backgroundColor: COLORS.etf }} />
          <span className="text-slate-400">{etfSymbol}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 rounded border-t border-dashed" style={{ borderColor: COLORS.btc }} />
          <span className="text-slate-400">BTC</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 rounded border-t border-dashed" style={{ borderColor: COLORS.eth }} />
          <span className="text-slate-400">ETH</span>
        </div>
      </div>
    </div>
  )
}
