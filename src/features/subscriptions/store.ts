import { makeStore } from '@/store/createStore'
import { useUserId } from '@/store/userContext'
import { Subscription } from '@/types'
import { dbGetAll, dbPut, dbDelete } from '@/lib/db'

interface SubscriptionState {
  subscriptions: Subscription[]; loaded: boolean
  load: (uid: string) => Promise<void>
  add: (item: Subscription, uid: string) => Promise<void>
  remove: (id: string, uid: string) => Promise<void>
  update: (item: Subscription, uid: string) => Promise<void>
}
const getStore = makeStore<SubscriptionState>((set) => ({
  subscriptions: [], loaded: false,
  load: async (uid) => { const data = await dbGetAll<Subscription>('subscriptions', uid); set(() => ({ subscriptions: data, loaded: true })) },
  add: async (item, uid) => { await dbPut('subscriptions', uid, item); set(s => ({ subscriptions: [item, ...s.subscriptions] })) },
  remove: async (id, uid) => { await dbDelete('subscriptions', id); set(s => ({ subscriptions: s.subscriptions.filter(x => x.id !== id) })) },
  update: async (item, uid) => { await dbPut('subscriptions', uid, item); set(s => ({ subscriptions: s.subscriptions.map(x => x.id === item.id ? item : x) })) },
}))
export const useSubscriptionStore = () => getStore(useUserId())()
export const getSubscriptionStore = getStore
