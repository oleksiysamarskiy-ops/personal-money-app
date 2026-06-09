import { z } from 'zod'

export const expenseCategories = [
  'Food',
  'Transport',
  'Housing',
  'Health',
  'Entertainment',
  'Shopping',
  'Education',
  'Travel',
  'Subscriptions',
  'Other',
]

export const categoryColors: Record<string, string> = {
  Food: '#6c63ff',
  Transport: '#3b82f6',
  Housing: '#22c55e',
  Health: '#f59e0b',
  Entertainment: '#ec4899',
  Shopping: '#8b5cf6',
  Education: '#06b6d4',
  Travel: '#f97316',
  Subscriptions: '#ef4444',
  Other: '#6b7280',
}

export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string(),
  category: z.string(),
  note: z.string().optional(),
  date: z.string(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>
