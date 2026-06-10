import { create } from 'zustand'
import { Income } from '@/types'
import { loadState, saveState } from '@/store/persist'

const KEY = 'ft-income'
type S = { incomes: Income[]; add:(e:Income)=>void; remove:(id:string)=>void; update:(e:Income)=>void }
const stores = new Map<string, ReturnType<typeof create<S>>>()

export function getIncomeStore(userId: string) {
  if (!stores.has(userId)) {
    stores.set(userId, create<S>((set) => ({
      incomes: loadState(KEY, [], userId),
      add: (e) => set(s => { const incomes=[...s.incomes,e]; saveState(KEY,incomes,userId); return {incomes} }),
      remove: (id) => set(s => { const incomes=s.incomes.filter(e=>e.id!==id); saveState(KEY,incomes,userId); return {incomes} }),
      update: (e) => set(s => { const incomes=s.incomes.map(x=>x.id===e.id?e:x); saveState(KEY,incomes,userId); return {incomes} }),
    })))
  }
  return stores.get(userId)!
}

export const useIncomeStore = (userId: string) => getIncomeStore(userId)()
