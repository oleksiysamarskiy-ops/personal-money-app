import { create } from 'zustand'
import { AppSettings, Currency } from '@/types'
import { loadState, saveState } from './persist'

const KEY = 'ft-settings'
interface SettingsStore {
  settings: AppSettings
  setBaseCurrency: (c: Currency) => void
}
export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: loadState(KEY, { baseCurrency: 'USD' as Currency }),
  setBaseCurrency: (baseCurrency) => set(s => {
    const settings = { ...s.settings, baseCurrency }
    saveState(KEY, settings)
    return { settings }
  }),
}))
