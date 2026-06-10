import { makeStore } from '@/store/createStore'
import { useUserId } from '@/store/userContext'
import { Expense } from '@/types'
import { dbGetAll, dbPut, dbDelete } from '@/lib/db'

interface ExpenseState {
  expenses: Expense[]; loaded: boolean
  load: (uid: string) => Promise<void>
  add: (item: Expense, uid: string) => Promise<void>
  remove: (id: string, uid: string) => Promise<void>
  update: (item: Expense, uid: string) => Promise<void>
}
const getStore = makeStore<ExpenseState>((set) => ({
  expenses: [], loaded: false,
  load: async (uid) => { const data = await dbGetAll<Expense>('expenses', uid); set(() => ({ expenses: data, loaded: true })) },
  add: async (item, uid) => { await dbPut('expenses', uid, item); set(s => ({ expenses: [item, ...s.expenses] })) },
  remove: async (id, uid) => { await dbDelete('expenses', id); set(s => ({ expenses: s.expenses.filter(x => x.id !== id) })) },
  update: async (item, uid) => { await dbPut('expenses', uid, item); set(s => ({ expenses: s.expenses.map(x => x.id === item.id ? item : x) })) },
}))
export const useExpenseStore = () => getStore(useUserId())()
export const getExpenseStore = getStore
