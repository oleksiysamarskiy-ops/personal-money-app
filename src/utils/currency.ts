import { Currency } from '@/types'
import { FALLBACK_RATES } from './exchangeRates'

// Dynamic rates - updated by the app on load; falls back to static
export let RATES: Record<Currency, number> = { ...FALLBACK_RATES }

export function updateRates(newRates: Record<Currency, number>) {
  RATES = newRates
}

export function toBase(amount: number, from: Currency, base: Currency): number {
  if (from === base) return amount
  return (amount / RATES[from]) * RATES[base]
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$', EUR: '€', GBP: '£', PLN: 'zł', UAH: '₴',
}

export function fmt(amount: number, currency: Currency): string {
  const sym = CURRENCY_SYMBOLS[currency]
  const abs = Math.abs(amount)
  const str =
    abs >= 1000
      ? abs.toLocaleString('ru-RU', { maximumFractionDigits: 0 })
      : abs.toLocaleString('ru-RU', { maximumFractionDigits: 2 })
  return `${amount < 0 ? '-' : ''}${sym}${str}`
}
