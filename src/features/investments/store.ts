import { create } from 'zustand'
import { Investment } from '@/types'
import { loadState, saveState } from '@/store/persist'

const KEY = 'ft-investments'
type S = { investments: Investment[]; add:(e:Investment)=>void; remove:(id:string)=>void; update:(e:Investment)=>void }
const stores = new Map<string, ReturnType<typeof create<S>>>()

export function getInvestmentStore(userId: string) {
  if (!stores.has(userId)) {
    stores.set(userId, create<S>((set) => ({
      investments: loadState(KEY, [], userId),
      add: (e) => set(s => { const investments=[...s.investments,e]; saveState(KEY,investments,userId); return {investments} }),
      remove: (id) => set(s => { const investments=s.investments.filter(e=>e.id!==id); saveState(KEY,investments,userId); return {investments} }),
      update: (e) => set(s => { const investments=s.investments.map(x=>x.id===e.id?e:x); saveState(KEY,investments,userId); return {investments} }),
    })))
  }
  return stores.get(userId)!
}

export const useInvestmentStore = (userId: string) => getInvestmentStore(userId)()
