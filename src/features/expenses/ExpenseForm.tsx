import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuid } from 'uuid'
import { expenseSchema, ExpenseFormData, expenseCategories } from './schema'
import { useExpenseStore } from './store'
import { Btn, Field, fieldBase } from '@/components/ui'
import { Expense } from '@/types/expense'

interface Props { onClose?: () => void; initial?: Expense }
const currencies = ['USD', 'EUR', 'PLN', 'UAH', 'GBP', 'CHF']

export default function ExpenseForm({ onClose, initial }: Props) {
  const addExpense = useExpenseStore((s) => s.addExpense)
  const updateExpense = useExpenseStore((s) => s.updateExpense)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initial
      ? { amount: initial.amount, currency: initial.currency, category: initial.category, note: initial.note, date: initial.date }
      : { currency: 'USD', category: 'Еда', date: new Date().toISOString().slice(0, 10) },
  })

  const submit = (data: ExpenseFormData) => {
    if (initial) {
      updateExpense({ id: initial.id, createdAt: initial.createdAt, amount: data.amount, currency: data.currency, category: data.category, note: data.note, date: data.date })
    } else {
      addExpense({ id: uuid(), amount: data.amount, currency: data.currency, category: data.category, note: data.note, date: data.date, createdAt: new Date().toISOString() })
    }
    reset(); onClose?.()
  }

  return (
    <form onSubmit={handleSubmit(submit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 10 }}>
        <Field label="Сумма" error={errors.amount?.message}>
          <input style={fieldBase} type="number" step="0.01" placeholder="0" inputMode="decimal"
            {...register('amount', { valueAsNumber: true })} />
        </Field>
        <Field label="Валюта">
          <select style={{ ...fieldBase, paddingRight: 10 }} {...register('currency')}>
            {currencies.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Категория">
        <select style={{ ...fieldBase, paddingRight: 10 }} {...register('category')}>
          {expenseCategories.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
        </select>
      </Field>
      <Field label="Дата">
        <input style={fieldBase} type="date" {...register('date')} />
      </Field>
      <Field label="Заметка (необязательно)">
        <textarea style={{ ...fieldBase, resize: 'none', minHeight: 72 }} placeholder="Доп. информация…" {...register('note')} />
      </Field>
      <Btn type="submit" size="full" style={{ marginTop: 4 }}>{initial ? 'Сохранить' : 'Добавить расход'}</Btn>
    </form>
  )
}
