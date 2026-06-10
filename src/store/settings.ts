import { makeStore } from './createStore'
import { useUserId } from './userContext'
import { AppSettings, Currency } from '@/types'
import { dbGet, dbPut } from '@/lib/db'

interface SettingsState {
  settings: AppSettings; loaded: boolean
  load: (uid: string) => Promise<void>
  setBaseCurrency: (c: Currency, uid: string) => void
}
const getStore = makeStore<SettingsState>((set) => ({
  settings: { baseCurrency: 'USD' as Currency }, loaded: false,
  load: async (uid) => {
    const data = await dbGet<{ id: string; baseCurrency: Currency; _uid: string }>('settings', `settings_${uid}`)
    if (data) set(() => ({ settings: { baseCurrency: data.baseCurrency }, loaded: true }))
    else set(() => ({ loaded: true }))
  },
  setBaseCurrency: (baseCurrency, uid) => {
    set(() => ({ settings: { baseCurrency } }))
    dbPut('settings', uid, { id: `settings_${uid}`, baseCurrency })
  },
}))
export const useSettingsStore = () => getStore(useUserId())()
export const getSettingsStore = getStore
