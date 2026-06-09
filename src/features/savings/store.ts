import { create } from 'zustand'
import { SavingsEntry } from '@/types/savings'
import { loadState, saveState } from '@/store/persist'

const STORAGE_KEY = 'finance-savings'

interface SavingsStore {
  entries: SavingsEntry[]
  addEntry: (entry: SavingsEntry) => void
  removeEntry: (id: string) => void
  updateEntry: (entry: SavingsEntry) => void
}

export const useSavingsStore = create<SavingsStore>((set) => ({
  entries: loadState(STORAGE_KEY, []),

  addEntry: (entry) =>
    set((state) => {
      const entries = [...state.entries, entry]
      saveState(STORAGE_KEY, entries)
      return { entries }
    }),

  removeEntry: (id) =>
    set((state) => {
      const entries = state.entries.filter((e) => e.id !== id)
      saveState(STORAGE_KEY, entries)
      return { entries }
    }),

  updateEntry: (entry) =>
    set((state) => {
      const entries = state.entries.map((e) => (e.id === entry.id ? entry : e))
      saveState(STORAGE_KEY, entries)
      return { entries }
    }),
}))
