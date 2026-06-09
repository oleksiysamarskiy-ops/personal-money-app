import { Expense } from '@/types/expense'
import { format } from 'date-fns'

export const getTotalExpenses = (expenses: Expense[]) =>
  expenses.reduce((sum, e) => sum + e.amount, 0)

export const getMonthlyExpenses = (expenses: Expense[]) => {
  const month = new Date().getMonth()
  const year = new Date().getFullYear()
  return expenses
    .filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === month && d.getFullYear() === year
    })
    .reduce((sum, e) => sum + e.amount, 0)
}

export const groupExpensesByCategory = (expenses: Expense[]) => {
  const result: Record<string, number> = {}
  expenses.forEach((e) => {
    result[e.category] = (result[e.category] || 0) + e.amount
  })
  return Object.entries(result).map(([name, value]) => ({ name, value }))
}

export const getTopCategory = (expenses: Expense[]) => {
  const grouped = groupExpensesByCategory(expenses)
  if (!grouped.length) return null
  return grouped.reduce((max, item) => (item.value > max.value ? item : max))
}

export const getExpensesByMonth = (expenses: Expense[]) => {
  const map: Record<string, number> = {}
  expenses.forEach((e) => {
    const key = format(new Date(e.date), 'MMM yyyy')
    map[key] = (map[key] || 0) + e.amount
  })
  return Object.entries(map)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([month, amount]) => ({ month, amount }))
}
