import { create } from 'zustand'
import { Debt, DebtPayment } from '@/types'
import { loadState, saveState } from '@/store/persist'
const KEY = 'ft-debts'
interface S {
  debts: Debt[]
  add:(d:Debt)=>void; remove:(id:string)=>void; update:(d:Debt)=>void
  addPayment:(debtId:string,p:DebtPayment)=>void
  removePayment:(debtId:string,paymentId:string)=>void
}
export const useDebtStore = create<S>((set) => ({
  debts: loadState(KEY, []),
  add: (d) => set(s => { const debts=[...s.debts,d]; saveState(KEY,debts); return {debts} }),
  remove: (id) => set(s => { const debts=s.debts.filter(d=>d.id!==id); saveState(KEY,debts); return {debts} }),
  update: (d) => set(s => { const debts=s.debts.map(x=>x.id===d.id?d:x); saveState(KEY,debts); return {debts} }),
  addPayment: (debtId,p) => set(s => {
    const debts=s.debts.map(d=>d.id===debtId?{...d,payments:[...d.payments,p]}:d)
    saveState(KEY,debts); return {debts}
  }),
  removePayment: (debtId,paymentId) => set(s => {
    const debts=s.debts.map(d=>d.id===debtId?{...d,payments:d.payments.filter(p=>p.id!==paymentId)}:d)
    saveState(KEY,debts); return {debts}
  }),
}))
