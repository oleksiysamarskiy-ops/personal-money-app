import { makeStore } from '@/store/createStore'
import { useUserId } from '@/store/userContext'
import { Income } from '@/types'
import { dbGetAll, dbPut, dbDelete } from '@/lib/db'

interface IncomeState {
  incomes: Income[]; loaded: boolean
  load: (uid: string) => Promise<void>
  add: (item: Income, uid: string) => Promise<void>
  remove: (id: string, uid: string) => Promise<void>
  update: (item: Income, uid: string) => Promise<void>
}
const getStore = makeStore<IncomeState>((set) => ({
  incomes: [], loaded: false,
  load: async (uid) => { const data = await dbGetAll<Income>('incomes', uid); set(() => ({ incomes: data, loaded: true })) },
  add: async (item, uid) => { await dbPut('incomes', uid, item); set(s => ({ incomes: [item, ...s.incomes] })) },
  remove: async (id, uid) => { await dbDelete('incomes', id); set(s => ({ incomes: s.incomes.filter(x => x.id !== id) })) },
  update: async (item, uid) => { await dbPut('incomes', uid, item); set(s => ({ incomes: s.incomes.map(x => x.id === item.id ? item : x) })) },
}))
export const useIncomeStore = () => getStore(useUserId())()
export const getIncomeStore = getStore
