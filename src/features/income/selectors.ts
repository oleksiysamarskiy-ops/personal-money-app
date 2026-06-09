import { Income } from '@/types/income'
import { format } from 'date-fns'

export const getTotalIncome = (incomes: Income[]) =>
  incomes.reduce((sum, income) => sum + income.amount, 0)

export const getMonthlyIncome = (incomes: Income[]) => {
  const month = new Date().getMonth()
  const year = new Date().getFullYear()
  return incomes
    .filter((income) => {
      const d = new Date(income.date)
      return d.getMonth() === month && d.getFullYear() === year
    })
    .reduce((sum, income) => sum + income.amount, 0)
}

export const getIncomeByMonth = (incomes: Income[]) => {
  const map: Record<string, number> = {}
  incomes.forEach((income) => {
    const key = format(new Date(income.date), 'MMM yyyy')
    map[key] = (map[key] || 0) + income.amount
  })
  return Object.entries(map)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([month, amount]) => ({ month, amount }))
}
