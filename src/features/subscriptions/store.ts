import { create } from 'zustand'
import { Subscription } from '@/types'
import { loadState, saveState } from '@/store/persist'

const KEY = 'ft-subscriptions'
type S = { subscriptions: Subscription[]; add:(e:Subscription)=>void; remove:(id:string)=>void; update:(e:Subscription)=>void }
const stores = new Map<string, ReturnType<typeof create<S>>>()

export function getSubscriptionStore(userId: string) {
  if (!stores.has(userId)) {
    stores.set(userId, create<S>((set) => ({
      subscriptions: loadState(KEY, [], userId),
      add: (e) => set(s => { const subscriptions=[...s.subscriptions,e]; saveState(KEY,subscriptions,userId); return {subscriptions} }),
      remove: (id) => set(s => { const subscriptions=s.subscriptions.filter(e=>e.id!==id); saveState(KEY,subscriptions,userId); return {subscriptions} }),
      update: (e) => set(s => { const subscriptions=s.subscriptions.map(x=>x.id===e.id?e:x); saveState(KEY,subscriptions,userId); return {subscriptions} }),
    })))
  }
  return stores.get(userId)!
}

export const useSubscriptionStore = (userId: string) => getSubscriptionStore(userId)()
