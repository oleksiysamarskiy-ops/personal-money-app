import { z } from 'zod'

export const incomeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string(),
  source: z.string().min(2, 'Source must be at least 2 characters'),
  note: z.string().optional(),
  date: z.string(),
})

export type IncomeFormData = z.infer<typeof incomeSchema>
