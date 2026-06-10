import { create } from 'zustand'
import { Expense } from '@/types'
import { loadState, saveState } from '@/store/persist'
const KEY = 'ft-expenses'
interface S { expenses: Expense[]; add:(e:Expense)=>void; remove:(id:string)=>void; update:(e:Expense)=>void }
export const useExpenseStore = create<S>((set) => ({
  expenses: loadState(KEY, []),
  add: (e) => set(s => { const expenses=[...s.expenses,e]; saveState(KEY,expenses); return {expenses} }),
  remove: (id) => set(s => { const expenses=s.expenses.filter(e=>e.id!==id); saveState(KEY,expenses); return {expenses} }),
  update: (e) => set(s => { const expenses=s.expenses.map(x=>x.id===e.id?e:x); saveState(KEY,expenses); return {expenses} }),
}))
