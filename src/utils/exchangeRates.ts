import { Currency } from '@/types'

// Fallback rates (used if API is unavailable)
const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  PLN: 3.97,
  UAH: 41.5,
}

let cachedRates: Record<Currency, number> | null = null
let cacheTime = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function fetchExchangeRates(): Promise<Record<Currency, number>> {
  const now = Date.now()
  if (cachedRates && now - cacheTime < CACHE_TTL) {
    return cachedRates
  }

  try {
    // Using exchangerate-api.com free tier (no key needed for base USD)
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    const rates = data.rates as Record<string, number>

    const result: Record<Currency, number> = {
      USD: 1,
      EUR: rates['EUR'] ?? FALLBACK_RATES.EUR,
      GBP: rates['GBP'] ?? FALLBACK_RATES.GBP,
      PLN: rates['PLN'] ?? FALLBACK_RATES.PLN,
      UAH: rates['UAH'] ?? FALLBACK_RATES.UAH,
    }

    cachedRates = result
    cacheTime = now
    return result
  } catch {
    // Return fallback if API fails
    return FALLBACK_RATES
  }
}

export { FALLBACK_RATES }
