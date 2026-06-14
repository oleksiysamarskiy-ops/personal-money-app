import { create } from 'zustand'
import { Investment } from '@/types'
import { loadState, saveState } from '@/store/persist'
const KEY = 'ft-investments'
interface S { investments: Investment[]; add:(i:Investment)=>void; remove:(id:string)=>void; update:(i:Investment)=>void }
export const useInvestmentStore = create<S>((set) => ({
  investments: loadState(KEY, []),
  add: (i) => set(s => { const investments=[...s.investments,i]; saveState(KEY,investments); return {investments} }),
  remove: (id) => set(s => { const investments=s.investments.filter(i=>i.id!==id); saveState(KEY,investments); return {investments} }),
  update: (i) => set(s => { const investments=s.investments.map(x=>x.id===i.id?i:x); saveState(KEY,investments); return {investments} }),
}))
