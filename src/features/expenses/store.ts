import { create } from 'zustand'
import { Expense } from '@/types'
import { loadState, saveState } from '@/store/persist'

const KEY = 'ft-expenses'

type S = { expenses: Expense[]; add:(e:Expense)=>void; remove:(id:string)=>void; update:(e:Expense)=>void }

const stores = new Map<string, ReturnType<typeof create<S>>>()

export function getExpenseStore(userId: string) {
  if (!stores.has(userId)) {
    stores.set(userId, create<S>((set) => ({
      expenses: loadState(KEY, [], userId),
      add: (e) => set(s => { const expenses=[...s.expenses,e]; saveState(KEY,expenses,userId); return {expenses} }),
      remove: (id) => set(s => { const expenses=s.expenses.filter(e=>e.id!==id); saveState(KEY,expenses,userId); return {expenses} }),
      update: (e) => set(s => { const expenses=s.expenses.map(x=>x.id===e.id?e:x); saveState(KEY,expenses,userId); return {expenses} }),
    })))
  }
  return stores.get(userId)!
}

export const useExpenseStore = (userId: string) => getExpenseStore(userId)()
