import { Income } from '@/types/income'
import { format } from 'date-fns'

export const getTotalIncome = (incomes: Income[]) =>
  incomes.reduce((sum, i) => sum + i.amount, 0)

export const getMonthlyIncome = (incomes: Income[]) => {
  const month = new Date().getMonth()
  const year = new Date().getFullYear()
  return incomes
    .filter(i => { const d = new Date(i.date); return d.getMonth() === month && d.getFullYear() === year })
    .reduce((sum, i) => sum + i.amount, 0)
}

export const getIncomeByMonth = (incomes: Income[]) => {
  const map: Record<string, number> = {}
  incomes.forEach(i => {
    const key = format(new Date(i.date), 'MMM yy')
    map[key] = (map[key] || 0) + i.amount
  })
  return Object.entries(map)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([month, amount]) => ({ month, amount }))
}
