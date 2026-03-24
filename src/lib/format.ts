import { formatUnits } from 'viem'

const DISPLAY_LOCALE = 'en-US'

export function formatCurrency(value?: bigint, decimals: number = 18, digits: number = 2) {
  if (value === undefined) return '$0.00'
  return `$${Number(formatUnits(value, decimals)).toLocaleString(DISPLAY_LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}

export function formatCompactCurrency(value?: bigint, decimals: number = 18) {
  if (value === undefined) return '$0'
  return `$${Number(formatUnits(value, decimals)).toLocaleString(DISPLAY_LOCALE, {
    notation: 'compact',
    maximumFractionDigits: 2,
  })}`
}

export function formatTokenAmount(value?: bigint, decimals: number = 18, digits: number = 4) {
  if (value === undefined) return '0'
  return Number(formatUnits(value, decimals)).toLocaleString(DISPLAY_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })
}

export function formatBps(value?: bigint | number) {
  const numericValue = typeof value === 'bigint' ? Number(value) : (value ?? 0)
  return `${(numericValue / 100).toFixed(2)}%`
}

export function formatWeight(value?: bigint | number) {
  const numericValue = typeof value === 'bigint' ? Number(value) : (value ?? 0)
  return `${(numericValue / 100).toFixed(2)}%`
}

export function shortAddress(address?: string | null) {
  if (!address) return 'Not configured'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
