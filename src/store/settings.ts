import { makeStore } from './createStore'
import { useUserId } from './userContext'
import { AppSettings, Currency } from '@/types'
import { dbLoad, dbUpsert } from '@/lib/supabase'

interface SettingsState {
  settings: AppSettings
  loaded: boolean
  load: (userId: string) => Promise<void>
  setBaseCurrency: (c: Currency, userId: string) => void
}

const getStore = makeStore<SettingsState>((set) => ({
  settings: { baseCurrency: 'USD' as Currency },
  loaded: false,
  load: async (userId) => {
    const data = await dbLoad<{ id: string; base_currency: Currency }>('user_settings', userId)
    if (data.length > 0) {
      set(() => ({ settings: { baseCurrency: data[0].base_currency }, loaded: true }))
    } else {
      set(() => ({ loaded: true }))
    }
  },
  setBaseCurrency: (baseCurrency, userId) => {
    set(() => ({ settings: { baseCurrency } }))
    dbUpsert('user_settings', userId, { id: userId, base_currency: baseCurrency })
  },
}))

export const useSettingsStore = () => {
  const uid = useUserId()
  return getStore(uid)()
}
export const getSettingsStore = getStore
