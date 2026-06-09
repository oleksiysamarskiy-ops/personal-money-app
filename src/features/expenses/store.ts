import { create } from 'zustand'
import { Expense } from '@/types/expense'
import { loadState, saveState } from '@/store/persist'

const STORAGE_KEY = 'finance-expenses'

interface ExpenseStore {
  expenses: Expense[]
  addExpense: (expense: Expense) => void
  removeExpense: (id: string) => void
  updateExpense: (expense: Expense) => void
}

export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: loadState(STORAGE_KEY, []),

  addExpense: (expense) =>
    set((state) => {
      const expenses = [...state.expenses, expense]
      saveState(STORAGE_KEY, expenses)
      return { expenses }
    }),

  removeExpense: (id) =>
    set((state) => {
      const expenses = state.expenses.filter((e) => e.id !== id)
      saveState(STORAGE_KEY, expenses)
      return { expenses }
    }),

  updateExpense: (expense) =>
    set((state) => {
      const expenses = state.expenses.map((e) => (e.id === expense.id ? expense : e))
      saveState(STORAGE_KEY, expenses)
      return { expenses }
    }),
}))
