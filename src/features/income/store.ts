import { makeStore } from '@/store/createStore'
import { useUserId } from '@/store/userContext'
import { Income } from '@/types'
import { dbLoad, dbInsert, dbUpdate, dbDelete } from '@/lib/supabase'

interface IncomeState {
  incomes: Income[]
  loaded: boolean
  load: (userId: string) => Promise<void>
  add: (item: Income, userId: string) => Promise<void>
  remove: (id: string, userId: string) => Promise<void>
  update: (item: Income, userId: string) => Promise<void>
}

const getStore = makeStore<IncomeState>((set) => ({
  incomes: [],
  loaded: false,
  load: async (userId) => {
    const data = await dbLoad<Income>('incomes', userId)
    set(() => ({ incomes: data, loaded: true }))
  },
  add: async (item, userId) => {
    await dbInsert('incomes', userId, item)
    set((s) => ({ incomes: [item, ...s.incomes] }))
  },
  remove: async (id, userId) => {
    await dbDelete('incomes', userId, id)
    set((s) => ({ incomes: s.incomes.filter(x => x.id !== id) }))
  },
  update: async (item, userId) => {
    await dbUpdate('incomes', userId, item)
    set((s) => ({ incomes: s.incomes.map(x => x.id === item.id ? item : x) }))
  },
}))

export const useIncomeStore = () => {
  const uid = useUserId()
  return getStore(uid)()
}
export const getIncomeStore = getStore
