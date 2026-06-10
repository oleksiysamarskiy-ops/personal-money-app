import { makeStore } from '@/store/createStore'
import { useUserId } from '@/store/userContext'
import { SavingsEntry } from '@/types'
import { dbLoad, dbInsert, dbUpdate, dbDelete } from '@/lib/supabase'

interface SavingsState {
  entries: SavingsEntry[]
  loaded: boolean
  load: (userId: string) => Promise<void>
  add: (item: SavingsEntry, userId: string) => Promise<void>
  remove: (id: string, userId: string) => Promise<void>
  update: (item: SavingsEntry, userId: string) => Promise<void>
}

const getStore = makeStore<SavingsState>((set) => ({
  entries: [],
  loaded: false,
  load: async (userId) => {
    const data = await dbLoad<SavingsEntry>('savings', userId)
    set(() => ({ entries: data, loaded: true }))
  },
  add: async (item, userId) => {
    await dbInsert('savings', userId, item)
    set((s) => ({ entries: [item, ...s.entries] }))
  },
  remove: async (id, userId) => {
    await dbDelete('savings', userId, id)
    set((s) => ({ entries: s.entries.filter(x => x.id !== id) }))
  },
  update: async (item, userId) => {
    await dbUpdate('savings', userId, item)
    set((s) => ({ entries: s.entries.map(x => x.id === item.id ? item : x) }))
  },
}))

export const useSavingsStore = () => {
  const uid = useUserId()
  return getStore(uid)()
}
export const getSavingsStore = getStore
