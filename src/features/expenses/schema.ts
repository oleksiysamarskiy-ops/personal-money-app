import { z } from 'zod'

export const expenseCategories = [
  { value: 'Еда',           label: 'Еда',           emoji: '🍔', color: '#F5A623' },
  { value: 'Транспорт',     label: 'Транспорт',     emoji: '🚗', color: '#4A9EFF' },
  { value: 'Жильё',         label: 'Жильё',         emoji: '🏠', color: '#3DD68C' },
  { value: 'Здоровье',      label: 'Здоровье',      emoji: '💊', color: '#F2555A' },
  { value: 'Развлечения',   label: 'Развлечения',   emoji: '🎮', color: '#A855F7' },
  { value: 'Покупки',       label: 'Покупки',       emoji: '🛍️', color: '#EC4899' },
  { value: 'Образование',   label: 'Образование',   emoji: '📚', color: '#5B5BD6' },
  { value: 'Путешествия',   label: 'Путешествия',   emoji: '✈️', color: '#06B6D4' },
  { value: 'Подписки',      label: 'Подписки',      emoji: '📱', color: '#F97316' },
  { value: 'Прочее',        label: 'Прочее',        emoji: '📦', color: '#6B7280' },
]

export const getCategoryMeta = (value: string) =>
  expenseCategories.find(c => c.value === value) || expenseCategories[expenseCategories.length - 1]

export const expenseSchema = z.object({
  amount: z.number().positive('Введите сумму'),
  currency: z.string(),
  category: z.string(),
  note: z.string().optional(),
  date: z.string(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>
