import { create } from 'zustand'
import { Subscription } from '@/types'
import { loadState, saveState } from '@/store/persist'
const KEY = 'ft-subscriptions'
interface S { subscriptions: Subscription[]; add:(s:Subscription)=>void; remove:(id:string)=>void; update:(s:Subscription)=>void; markPaid:(id:string)=>void }
export const useSubscriptionStore = create<S>((set) => ({
  subscriptions: loadState(KEY, []),
  add: (s) => set(st => { const subscriptions=[...st.subscriptions,s]; saveState(KEY,subscriptions); return {subscriptions} }),
  remove: (id) => set(st => { const subscriptions=st.subscriptions.filter(s=>s.id!==id); saveState(KEY,subscriptions); return {subscriptions} }),
  update: (s) => set(st => { const subscriptions=st.subscriptions.map(x=>x.id===s.id?s:x); saveState(KEY,subscriptions); return {subscriptions} }),
  markPaid: (id) => set(st => { const subscriptions=st.subscriptions.map(x=> {
    if(x.id!==id) return x;
    const d=new Date(x.nextBillingDate);
    if(x.billingCycle==='monthly') d.setMonth(d.getMonth()+1);
    else if(x.billingCycle==='yearly') d.setFullYear(d.getFullYear()+1);
    else d.setDate(d.getDate()+7);
    return {...x,nextBillingDate:d.toISOString().slice(0,10)};
  }); saveState(KEY,subscriptions); return {subscriptions} }),
}))
