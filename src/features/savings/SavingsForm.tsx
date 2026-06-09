import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuid } from 'uuid'
import { savingsSchema, SavingsFormData } from './schema'
import { useSavingsStore } from './store'
import { Btn, Field, fieldBase } from '@/components/ui'
import { SavingsEntry } from '@/types/savings'

interface Props { onClose?: () => void; initial?: SavingsEntry }
const currencies = ['USD', 'EUR', 'PLN', 'UAH', 'GBP', 'CHF']

export default function SavingsForm({ onClose, initial }: Props) {
  const addEntry = useSavingsStore((s) => s.addEntry)
  const updateEntry = useSavingsStore((s) => s.updateEntry)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SavingsFormData>({
    resolver: zodResolver(savingsSchema),
    defaultValues: initial
      ? { amount: initial.amount, currency: initial.currency, note: initial.note, date: initial.date }
      : { currency: 'USD', date: new Date().toISOString().slice(0, 10) },
  })

  const submit = (data: SavingsFormData) => {
    if (initial) {
      updateEntry({ id: initial.id, createdAt: initial.createdAt, amount: data.amount, currency: data.currency, note: data.note, date: data.date })
    } else {
      addEntry({ id: uuid(), amount: data.amount, currency: data.currency, note: data.note, date: data.date, createdAt: new Date().toISOString() })
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
      <Field label="Дата">
        <input style={fieldBase} type="date" {...register('date')} />
      </Field>
      <Field label="Заметка (необязательно)">
        <textarea style={{ ...fieldBase, resize: 'none', minHeight: 72 }} placeholder="Цель накопления…" {...register('note')} />
      </Field>
      <Btn type="submit" size="full" style={{ marginTop: 4 }}>{initial ? 'Сохранить' : 'Добавить сбережения'}</Btn>
    </form>
  )
}
