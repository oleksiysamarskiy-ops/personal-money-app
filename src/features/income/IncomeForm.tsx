import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuid } from 'uuid'
import { incomeSchema, IncomeFormData } from './schema'
import { useIncomeStore } from './store'
import { Btn, FormField, inputStyle, selectStyle, textareaStyle } from '@/components/ui'

interface Props {
  onClose?: () => void
  initial?: IncomeFormData & { id: string }
}

const currencies = ['USD', 'EUR', 'PLN', 'UAH', 'GBP', 'CHF']

export default function IncomeForm({ onClose, initial }: Props) {
  const addIncome = useIncomeStore((s) => s.addIncome)
  const updateIncome = useIncomeStore((s) => s.updateIncome)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: initial || { currency: 'USD', date: new Date().toISOString().slice(0, 10) },
  })

  const submit = (data: IncomeFormData) => {
    if (initial) {
      updateIncome({ ...initial, ...data })
    } else {
      addIncome({ id: uuid(), ...data, createdAt: new Date().toISOString() })
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

      <FormField label="Source" error={errors.source?.message}>
        <input style={inputStyle} placeholder="e.g. Salary, Freelance, Dividends"
          {...register('source')} />
      </FormField>

      <FormField label="Date">
        <input style={inputStyle} type="date" {...register('date')} />
      </FormField>

      <FormField label="Note (optional)">
        <textarea style={textareaStyle} placeholder="Any additional details..."
          {...register('note')} />
      </FormField>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
        {onClose && <Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn>}
        <Btn type="submit">{initial ? 'Update' : 'Add Income'}</Btn>
      </div>
    </form>
  )
}
