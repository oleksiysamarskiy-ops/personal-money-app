import { makeStore } from '@/store/createStore'
import { useUserId } from '@/store/userContext'
import { Investment } from '@/types'
import { dbLoad, dbInsert, dbUpdate, dbDelete } from '@/lib/supabase'

interface InvestmentState {
  investments: Investment[]
  loaded: boolean
  load: (userId: string) => Promise<void>
  add: (item: Investment, userId: string) => Promise<void>
  remove: (id: string, userId: string) => Promise<void>
  update: (item: Investment, userId: string) => Promise<void>
}

const getStore = makeStore<InvestmentState>((set) => ({
  investments: [],
  loaded: false,
  load: async (userId) => {
    const data = await dbLoad<Investment>('investments', userId)
    set(() => ({ investments: data, loaded: true }))
  },
  add: async (item, userId) => {
    await dbInsert('investments', userId, item)
    set((s) => ({ investments: [item, ...s.investments] }))
  },
  remove: async (id, userId) => {
    await dbDelete('investments', userId, id)
    set((s) => ({ investments: s.investments.filter(x => x.id !== id) }))
  },
  update: async (item, userId) => {
    await dbUpdate('investments', userId, item)
    set((s) => ({ investments: s.investments.map(x => x.id === item.id ? item : x) }))
  },
}))

export const useInvestmentStore = () => {
  const uid = useUserId()
  return getStore(uid)()
}
export const getInvestmentStore = getStore
