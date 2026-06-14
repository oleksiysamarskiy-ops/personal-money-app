import { create } from 'zustand'
import { SavingsEntry } from '@/types'
import { loadState, saveState } from '@/store/persist'
const KEY = 'ft-savings'
interface S { entries: SavingsEntry[]; add:(e:SavingsEntry)=>void; remove:(id:string)=>void; update:(e:SavingsEntry)=>void }
export const useSavingsStore = create<S>((set) => ({
  entries: loadState(KEY, []),
  add: (e) => set(s => { const entries=[...s.entries,e]; saveState(KEY,entries); return {entries} }),
  remove: (id) => set(s => { const entries=s.entries.filter(e=>e.id!==id); saveState(KEY,entries); return {entries} }),
  update: (e) => set(s => { const entries=s.entries.map(x=>x.id===e.id?e:x); saveState(KEY,entries); return {entries} }),
}))
