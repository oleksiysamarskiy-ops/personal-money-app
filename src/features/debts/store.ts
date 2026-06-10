import { makeStore } from '@/store/createStore'
import { useUserId } from '@/store/userContext'
import { Debt, DebtPayment } from '@/types'
import { dbLoad, dbInsert, dbUpdate, dbDelete } from '@/lib/supabase'

interface DebtState {
  debts: Debt[]
  loaded: boolean
  load: (userId: string) => Promise<void>
  add: (item: Debt, userId: string) => Promise<void>
  remove: (id: string, userId: string) => Promise<void>
  update: (item: Debt, userId: string) => Promise<void>
  addPayment: (debtId: string, payment: DebtPayment, userId: string) => Promise<void>
  removePayment: (debtId: string, paymentId: string, userId: string) => Promise<void>
}

const getStore = makeStore<DebtState>((set) => ({
  debts: [],
  loaded: false,
  load: async (userId) => {
    const data = await dbLoad<Debt>('debts', userId)
    set(() => ({ debts: data, loaded: true }))
  },
  add: async (item, userId) => {
    await dbInsert('debts', userId, item)
    set((s) => ({ debts: [item, ...s.debts] }))
  },
  remove: async (id, userId) => {
    await dbDelete('debts', userId, id)
    set((s) => ({ debts: s.debts.filter(x => x.id !== id) }))
  },
  update: async (item, userId) => {
    await dbUpdate('debts', userId, item)
    set((s) => ({ debts: s.debts.map(x => x.id === item.id ? item : x) }))
  },
  addPayment: async (debtId, payment, userId) => {
    set((s) => {
      const debts = s.debts.map(d =>
        d.id === debtId ? { ...d, payments: [...d.payments, payment] } : d
      )
      const updated = debts.find(d => d.id === debtId)!
      dbUpdate('debts', userId, updated)
      return { debts }
    })
  },
  removePayment: async (debtId, paymentId, userId) => {
    set((s) => {
      const debts = s.debts.map(d =>
        d.id === debtId ? { ...d, payments: d.payments.filter(p => p.id !== paymentId) } : d
      )
      const updated = debts.find(d => d.id === debtId)!
      dbUpdate('debts', userId, updated)
      return { debts }
    })
  },
}))

export const useDebtStore = () => {
  const uid = useUserId()
  return getStore(uid)()
}
export const getDebtStore = getStore
