import { create } from 'zustand'
import { AppSettings, Currency } from '@/types'
import { loadState, saveState } from './persist'

const KEY = 'ft-settings'
interface SettingsStore {
  settings: AppSettings
  setBaseCurrency: (c: Currency) => void
}

const stores = new Map<string, ReturnType<typeof create<SettingsStore>>>()

export function getSettingsStore(userId: string) {
  if (!stores.has(userId)) {
    stores.set(userId, create<SettingsStore>((set) => ({
      settings: loadState(KEY, { baseCurrency: 'USD' as Currency }, userId),
      setBaseCurrency: (baseCurrency) => set(s => {
        const settings = { ...s.settings, baseCurrency }
        saveState(KEY, settings, userId)
        return { settings }
      }),
    })))
  }
  return stores.get(userId)!
}

export const useSettingsStore = (userId: string) => getSettingsStore(userId)()
