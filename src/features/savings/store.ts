import { create } from 'zustand'
import { SavingsEntry } from '@/types'
import { loadState, saveState } from '@/store/persist'

const KEY = 'ft-savings'
type S = { entries: SavingsEntry[]; add:(e:SavingsEntry)=>void; remove:(id:string)=>void; update:(e:SavingsEntry)=>void }
const stores = new Map<string, ReturnType<typeof create<S>>>()

export function getSavingsStore(userId: string) {
  if (!stores.has(userId)) {
    stores.set(userId, create<S>((set) => ({
      entries: loadState(KEY, [], userId),
      add: (e) => set(s => { const entries=[...s.entries,e]; saveState(KEY,entries,userId); return {entries} }),
      remove: (id) => set(s => { const entries=s.entries.filter(e=>e.id!==id); saveState(KEY,entries,userId); return {entries} }),
      update: (e) => set(s => { const entries=s.entries.map(x=>x.id===e.id?e:x); saveState(KEY,entries,userId); return {entries} }),
    })))
  }
  return stores.get(userId)!
}

export const useSavingsStore = (userId: string) => getSavingsStore(userId)()
