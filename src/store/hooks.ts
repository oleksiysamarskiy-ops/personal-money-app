// Central hooks that bind stores to the current user
import { useUserId } from './userContext'
import { getExpenseStore } from '@/features/expenses/store'
import { getIncomeStore } from '@/features/income/store'
import { getSavingsStore } from '@/features/savings/store'
import { getInvestmentStore } from '@/features/investments/store'
import { getDebtStore } from '@/features/debts/store'
import { getSubscriptionStore } from '@/features/subscriptions/store'
import { getSettingsStore } from './settings'

export const useExpenseStore = () => { const uid = useUserId(); return getExpenseStore(uid)() }
export const useIncomeStore = () => { const uid = useUserId(); return getIncomeStore(uid)() }
export const useSavingsStore = () => { const uid = useUserId(); return getSavingsStore(uid)() }
export const useInvestmentStore = () => { const uid = useUserId(); return getInvestmentStore(uid)() }
export const useDebtStore = () => { const uid = useUserId(); return getDebtStore(uid)() }
export const useSubscriptionStore = () => { const uid = useUserId(); return getSubscriptionStore(uid)() }
export const useSettingsStore = () => { const uid = useUserId(); return getSettingsStore(uid)() }
