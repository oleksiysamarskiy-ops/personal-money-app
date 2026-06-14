import { Currency } from '@/types'
export const RATES: Record<Currency, number> = { USD:1, EUR:0.92, GBP:0.79, PLN:3.97, UAH:41.5 }
export function toBase(amount: number, from: Currency, base: Currency): number {
  if (from === base) return amount
  return (amount / RATES[from]) * RATES[base]
}
export const CURRENCY_SYMBOLS: Record<Currency, string> = { USD:'$', EUR:'€', GBP:'£', PLN:'zł', UAH:'₴' }
export function fmt(amount: number, currency: Currency): string {
  const sym = CURRENCY_SYMBOLS[currency]
  const abs = Math.abs(amount)
  const str = abs >= 1000 ? abs.toLocaleString('ru-RU', {maximumFractionDigits:0}) : abs.toLocaleString('ru-RU', {maximumFractionDigits:2})
  return `${amount < 0 ? '-' : ''}${sym}${str}`
}
