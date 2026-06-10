import { makeStore } from '@/store/createStore'
import { useUserId } from '@/store/userContext'
import { Expense } from '@/types'
import { dbLoad, dbInsert, dbUpdate, dbDelete } from '@/lib/supabase'

interface ExpenseState {
  expenses: Expense[]
  loaded: boolean
  load: (userId: string) => Promise<void>
  add: (item: Expense, userId: string) => Promise<void>
  remove: (id: string, userId: string) => Promise<void>
  update: (item: Expense, userId: string) => Promise<void>
}

const getStore = makeStore<ExpenseState>((set) => ({
  expenses: [],
  loaded: false,
  load: async (userId) => {
    const data = await dbLoad<Expense>('expenses', userId)
    set(() => ({ expenses: data, loaded: true }))
  },
  add: async (item, userId) => {
    await dbInsert('expenses', userId, item)
    set((s) => ({ expenses: [item, ...s.expenses] }))
  },
  remove: async (id, userId) => {
    await dbDelete('expenses', userId, id)
    set((s) => ({ expenses: s.expenses.filter(x => x.id !== id) }))
  },
  update: async (item, userId) => {
    await dbUpdate('expenses', userId, item)
    set((s) => ({ expenses: s.expenses.map(x => x.id === item.id ? item : x) }))
  },
}))

export const useExpenseStore = () => {
  const uid = useUserId()
  return getStore(uid)()
}
export const getExpenseStore = getStore
