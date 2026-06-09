import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuid } from 'uuid'
import { expenseSchema, ExpenseFormData, expenseCategories } from './schema'
import { useExpenseStore } from './store'
import { Btn, FormField, inputStyle, selectStyle, textareaStyle } from '@/components/ui'
import { Expense } from '@/types/expense'

interface Props {
  onClose?: () => void
  initial?: Expense
}

const currencies = ['USD', 'EUR', 'PLN', 'UAH', 'GBP', 'CHF']

export default function ExpenseForm({ onClose, initial }: Props) {
  const addExpense = useExpenseStore((s) => s.addExpense)
  const updateExpense = useExpenseStore((s) => s.updateExpense)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initial || { currency: 'USD', category: 'Food', date: new Date().toISOString().slice(0, 10) },
  })

  const submit = (data: ExpenseFormData) => {
    if (initial) {
      updateExpense({ ...initial, ...data })
    } else {
      addExpense({ id: uuid(), ...data, createdAt: new Date().toISOString() })
    }
    reset()
    onClose?.()
  }

  return (
    <form onSubmit={handleSubmit(submit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormField label="Amount" error={errors.amount?.message}>
          <input style={inputStyle} type="number" step="0.01" placeholder="0.00"
            {...register('amount', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Currency">
          <select style={selectStyle} {...register('currency')}>
            {currencies.map((c) => <option key={c}>{c}</option>)}
          </select>
        </FormField>
      </div>

      <FormField label="Category">
        <select style={selectStyle} {...register('category')}>
          {expenseCategories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </FormField>

      <FormField label="Date">
        <input style={inputStyle} type="date" {...register('date')} />
      </FormField>

      <FormField label="Note (optional)">
        <textarea style={textareaStyle} placeholder="Any additional details…" {...register('note')} />
      </FormField>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
        {onClose && <Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn>}
        <Btn type="submit">{initial ? 'Update' : 'Add Expense'}</Btn>
      </div>
    </form>
  )
}
