import { create } from 'zustand'
import { Income } from '@/types/income'
import { loadState, saveState } from '@/store/persist'

const STORAGE_KEY = 'finance-income'

interface IncomeStore {
  incomes: Income[]
  addIncome: (income: Income) => void
  removeIncome: (id: string) => void
  updateIncome: (income: Income) => void
}

export const useIncomeStore = create<IncomeStore>((set) => ({
  incomes: loadState(STORAGE_KEY, []),

  addIncome: (income) =>
    set((state) => {
      const incomes = [...state.incomes, income]
      saveState(STORAGE_KEY, incomes)
      return { incomes }
    }),

  removeIncome: (id) =>
    set((state) => {
      const incomes = state.incomes.filter((i) => i.id !== id)
      saveState(STORAGE_KEY, incomes)
      return { incomes }
    }),

  updateIncome: (income) =>
    set((state) => {
      const incomes = state.incomes.map((i) => (i.id === income.id ? income : i))
      saveState(STORAGE_KEY, incomes)
      return { incomes }
    }),
}))
