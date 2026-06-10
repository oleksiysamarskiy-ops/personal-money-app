import { create } from 'zustand'
import { Income } from '@/types'
import { loadState, saveState } from '@/store/persist'
const KEY = 'ft-income'
interface S { incomes: Income[]; add:(i:Income)=>void; remove:(id:string)=>void; update:(i:Income)=>void }
export const useIncomeStore = create<S>((set) => ({
  incomes: loadState(KEY, []),
  add: (i) => set(s => { const incomes=[...s.incomes,i]; saveState(KEY,incomes); return {incomes} }),
  remove: (id) => set(s => { const incomes=s.incomes.filter(i=>i.id!==id); saveState(KEY,incomes); return {incomes} }),
  update: (i) => set(s => { const incomes=s.incomes.map(x=>x.id===i.id?i:x); saveState(KEY,incomes); return {incomes} }),
}))
