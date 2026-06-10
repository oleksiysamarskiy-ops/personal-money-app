import { create } from 'zustand'
import { Subscription } from '@/types'
import { loadState, saveState } from '@/store/persist'
const KEY = 'ft-subscriptions'
interface S { subscriptions: Subscription[]; add:(s:Subscription)=>void; remove:(id:string)=>void; update:(s:Subscription)=>void }
export const useSubscriptionStore = create<S>((set) => ({
  subscriptions: loadState(KEY, []),
  add: (s) => set(st => { const subscriptions=[...st.subscriptions,s]; saveState(KEY,subscriptions); return {subscriptions} }),
  remove: (id) => set(st => { const subscriptions=st.subscriptions.filter(s=>s.id!==id); saveState(KEY,subscriptions); return {subscriptions} }),
  update: (s) => set(st => { const subscriptions=st.subscriptions.map(x=>x.id===s.id?s:x); saveState(KEY,subscriptions); return {subscriptions} }),
}))
