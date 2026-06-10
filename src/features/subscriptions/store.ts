import { makeStore } from '@/store/createStore'
import { useUserId } from '@/store/userContext'
import { Subscription } from '@/types'
import { dbLoad, dbInsert, dbUpdate, dbDelete } from '@/lib/supabase'

interface SubscriptionState {
  subscriptions: Subscription[]
  loaded: boolean
  load: (userId: string) => Promise<void>
  add: (item: Subscription, userId: string) => Promise<void>
  remove: (id: string, userId: string) => Promise<void>
  update: (item: Subscription, userId: string) => Promise<void>
}

const getStore = makeStore<SubscriptionState>((set) => ({
  subscriptions: [],
  loaded: false,
  load: async (userId) => {
    const data = await dbLoad<Subscription>('subscriptions', userId)
    set(() => ({ subscriptions: data, loaded: true }))
  },
  add: async (item, userId) => {
    await dbInsert('subscriptions', userId, item)
    set((s) => ({ subscriptions: [item, ...s.subscriptions] }))
  },
  remove: async (id, userId) => {
    await dbDelete('subscriptions', userId, id)
    set((s) => ({ subscriptions: s.subscriptions.filter(x => x.id !== id) }))
  },
  update: async (item, userId) => {
    await dbUpdate('subscriptions', userId, item)
    set((s) => ({ subscriptions: s.subscriptions.map(x => x.id === item.id ? item : x) }))
  },
}))

export const useSubscriptionStore = () => {
  const uid = useUserId()
  return getStore(uid)()
}
export const getSubscriptionStore = getStore
