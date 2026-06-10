import { makeStore } from '@/store/createStore'
import { useUserId } from '@/store/userContext'
import { Investment } from '@/types'
import { dbGetAll, dbPut, dbDelete } from '@/lib/db'

interface InvestmentState {
  investments: Investment[]; loaded: boolean
  load: (uid: string) => Promise<void>
  add: (item: Investment, uid: string) => Promise<void>
  remove: (id: string, uid: string) => Promise<void>
  update: (item: Investment, uid: string) => Promise<void>
}
const getStore = makeStore<InvestmentState>((set) => ({
  investments: [], loaded: false,
  load: async (uid) => { const data = await dbGetAll<Investment>('investments', uid); set(() => ({ investments: data, loaded: true })) },
  add: async (item, uid) => { await dbPut('investments', uid, item); set(s => ({ investments: [item, ...s.investments] })) },
  remove: async (id, uid) => { await dbDelete('investments', id); set(s => ({ investments: s.investments.filter(x => x.id !== id) })) },
  update: async (item, uid) => { await dbPut('investments', uid, item); set(s => ({ investments: s.investments.map(x => x.id === item.id ? item : x) })) },
}))
export const useInvestmentStore = () => getStore(useUserId())()
export const getInvestmentStore = getStore
