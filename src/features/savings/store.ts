import { makeStore } from '@/store/createStore'
import { useUserId } from '@/store/userContext'
import { SavingsEntry } from '@/types'
import { dbGetAll, dbPut, dbDelete } from '@/lib/db'

interface SavingsState {
  entries: SavingsEntry[]; loaded: boolean
  load: (uid: string) => Promise<void>
  add: (item: SavingsEntry, uid: string) => Promise<void>
  remove: (id: string, uid: string) => Promise<void>
  update: (item: SavingsEntry, uid: string) => Promise<void>
}
const getStore = makeStore<SavingsState>((set) => ({
  entries: [], loaded: false,
  load: async (uid) => { const data = await dbGetAll<SavingsEntry>('savings', uid); set(() => ({ entries: data, loaded: true })) },
  add: async (item, uid) => { await dbPut('savings', uid, item); set(s => ({ entries: [item, ...s.entries] })) },
  remove: async (id, uid) => { await dbDelete('savings', id); set(s => ({ entries: s.entries.filter(x => x.id !== id) })) },
  update: async (item, uid) => { await dbPut('savings', uid, item); set(s => ({ entries: s.entries.map(x => x.id === item.id ? item : x) })) },
}))
export const useSavingsStore = () => getStore(useUserId())()
export const getSavingsStore = getStore
