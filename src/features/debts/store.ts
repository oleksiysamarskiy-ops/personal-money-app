import { makeStore } from '@/store/createStore'
import { useUserId } from '@/store/userContext'
import { Debt, DebtPayment } from '@/types'
import { dbGetAll, dbPut, dbDelete } from '@/lib/db'

interface DebtState {
  debts: Debt[]; loaded: boolean
  load: (uid: string) => Promise<void>
  add: (item: Debt, uid: string) => Promise<void>
  remove: (id: string, uid: string) => Promise<void>
  update: (item: Debt, uid: string) => Promise<void>
  addPayment: (debtId: string, payment: DebtPayment, uid: string) => Promise<void>
  removePayment: (debtId: string, paymentId: string, uid: string) => Promise<void>
}
const getStore = makeStore<DebtState>((set) => ({
  debts: [], loaded: false,
  load: async (uid) => { const data = await dbGetAll<Debt>('debts', uid); set(() => ({ debts: data, loaded: true })) },
  add: async (item, uid) => { await dbPut('debts', uid, item); set(s => ({ debts: [item, ...s.debts] })) },
  remove: async (id, uid) => { await dbDelete('debts', id); set(s => ({ debts: s.debts.filter(x => x.id !== id) })) },
  update: async (item, uid) => { await dbPut('debts', uid, item); set(s => ({ debts: s.debts.map(x => x.id === item.id ? item : x) })) },
  addPayment: async (debtId, payment, uid) => {
    set(s => {
      const debts = s.debts.map(d => d.id === debtId ? { ...d, payments: [...d.payments, payment] } : d)
      const updated = debts.find(d => d.id === debtId)!
      dbPut('debts', uid, updated)
      return { debts }
    })
  },
  removePayment: async (debtId, paymentId, uid) => {
    set(s => {
      const debts = s.debts.map(d => d.id === debtId ? { ...d, payments: d.payments.filter(p => p.id !== paymentId) } : d)
      const updated = debts.find(d => d.id === debtId)!
      dbPut('debts', uid, updated)
      return { debts }
    })
  },
}))
export const useDebtStore = () => getStore(useUserId())()
export const getDebtStore = getStore
