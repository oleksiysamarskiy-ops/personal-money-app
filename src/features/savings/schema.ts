import { z } from 'zod'
import { SavingsEntry } from '@/types/savings'
import { format } from 'date-fns'

export const savingsSchema = z.object({
  amount: z.number().positive('Введите сумму'),
  currency: z.string(),
  note: z.string().optional(),
  date: z.string(),
})

export type SavingsFormData = z.infer<typeof savingsSchema>

export const getTotalSavings = (entries: SavingsEntry[]) =>
  entries.reduce((sum, e) => sum + e.amount, 0)

export const getMonthlySavings = (entries: SavingsEntry[]) => {
  const month = new Date().getMonth()
  const year = new Date().getFullYear()
  return entries
    .filter(e => { const d = new Date(e.date); return d.getMonth() === month && d.getFullYear() === year })
    .reduce((sum, e) => sum + e.amount, 0)
}

export const getSavingsByMonth = (entries: SavingsEntry[]) => {
  const map: Record<string, number> = {}
  entries.forEach(e => {
    const key = format(new Date(e.date), 'MMM yy')
    map[key] = (map[key] || 0) + e.amount
  })
  return Object.entries(map)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([month, amount]) => ({ month, amount }))
}
