'use client'

import { useEffect, useRef } from 'react'
import { createChart, AreaSeries, LineSeries, type IChartApi, type Time, ColorType, LineStyle } from 'lightweight-charts'
import { useAccount } from 'wagmi'
import { useUserYieldCurve } from '@/hooks/v2/useUserYieldCurve'
import type { Address } from '@/lib/contracts/addresses'

const COLORS = {
  value: '#7EC7C3',
  valueArea: 'rgba(126,199,195,0.08)',
  costLine: 'rgba(255,255,255,0.35)',
  grid: 'rgba(255,255,255,0.04)',
  text: '#7C8B99',
}

interface V2YieldCurveProps {
  etfAddress?: Address | null
}

export function V2YieldCurve({ etfAddress }: V2YieldCurveProps) {
  const { isConnected } = useAccount()
  const { snapshots, isLoading } = useUserYieldCurve(etfAddress)
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || !isConnected || snapshots.length < 2) return

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

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
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: { borderVisible: false, timeVisible: false },
      handleScale: false,
      handleScroll: false,
    })

    const valueSeries = chart.addSeries(AreaSeries, {
      lineColor: COLORS.value,
      topColor: COLORS.valueArea,
      bottomColor: 'transparent',
      lineWidth: 2,
      priceFormat: { type: 'custom', formatter: (v: number) => '$' + v.toFixed(2) },
    })

    const costSeries = chart.addSeries(LineSeries, {
      color: COLORS.costLine,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceFormat: { type: 'custom', formatter: (v: number) => '$' + v.toFixed(2) },
    })

    valueSeries.setData(
      snapshots.map((s) => ({ time: s.timestamp as Time, value: s.positionValue }))
    )
    costSeries.setData(
      snapshots.map((s) => ({ time: s.timestamp as Time, value: s.costBasis }))
    )

    chart.timeScale().fitContent()
    chartRef.current = chart

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width, height: 200 })
      }
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [isConnected, snapshots])

  if (!isConnected) return null

  if (isLoading) {
    return (
      <div className="rounded-[2.2rem] border border-white/8 bg-[#0C1824] p-6">
        <div className="h-[260px] animate-pulse rounded-xl bg-white/5" />
      </div>
    )
  }

  if (snapshots.length < 2) {
    return (
      <div className="rounded-[2.2rem] border border-white/8 bg-[#0C1824] p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7EC7C3]">Position</div>
        <h3 className="mt-1.5 mb-4 text-xl font-semibold tracking-[-0.03em] text-white">Value Over Time</h3>
        <div className="flex h-[160px] items-center justify-center text-sm text-slate-500">
          Daily curve will appear after your position and ETF snapshots are indexed.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[2.2rem] border border-white/8 bg-[#0C1824] p-6 sm:p-7">
      <div className="mb-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7EC7C3]">Position</div>
        <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-white">Value Over Time</h3>
      </div>
      <div ref={containerRef} className="h-[200px]" />
      <div className="mt-3 flex gap-5 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 rounded" style={{ backgroundColor: COLORS.value }} />
          <span className="text-slate-400">Position Value</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 rounded border-t border-dashed" style={{ borderColor: COLORS.costLine }} />
          <span className="text-slate-400">Cost Basis</span>
        </div>
      </div>
    </div>
  )
}
