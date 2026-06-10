import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { Income, Currency } from '@/types'
import { BottomSheet, Btn, Field, fieldBase, Row, CatIcon, Empty, FAB, Card, SectionHead, Page, StatCard } from '@/components/ui'
import { totalIncome, monthlyIncome } from '@/utils/selectors'
import { fmt } from '@/utils/currency'
import { format } from 'date-fns'
import { useIncomeStore } from './store'
import { useSettingsStore } from '@/store/settings'
import { useUserId } from '@/store/userContext'

const schema = z.object({
  amount: z.number().positive('Введите сумму'),
  currency: z.enum(['USD','EUR','PLN','UAH','GBP'] as const),
  source: z.string().min(2,'Минимум 2 символа'),
  note: z.string().optional(),
  date: z.string(),
})
type FormData = z.infer<typeof schema>

function IncomeForm({ initial, onClose }: { initial?: Income; onClose: () => void }) {
  const uid = useUserId()
  const { add, update } = useIncomeStore()
  const { register, handleSubmit, formState:{errors} } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial ? { amount:initial.amount, currency:initial.currency, source:initial.source, note:initial.note, date:initial.date } : { currency:'USD', date:new Date().toISOString().slice(0,10) },
  })
  const submit = (data: FormData) => {
    if (initial) update({ ...initial, ...data }, uid)
    else add({ id:uuid(), createdAt:new Date().toISOString(), amount:data.amount, currency:data.currency, source:data.source, note:data.note, date:data.date }, uid)
    onClose()
  }
  return (
    <form onSubmit={handleSubmit(submit)} style={{ display:'flex',flexDirection:'column',gap:14 }}>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 100px',gap:10 }}>
        <Field label="Сумма" error={errors.amount?.message}><input style={fieldBase} type="number" step="0.01" placeholder="0" inputMode="decimal" {...register('amount',{valueAsNumber:true})} /></Field>
        <Field label="Валюта"><select style={{ ...fieldBase,paddingRight:8 }} {...register('currency')}>{(['USD','EUR','PLN','UAH','GBP'] as Currency[]).map(c=><option key={c}>{c}</option>)}</select></Field>
      </div>
      <Field label="Источник" error={errors.source?.message}><input style={fieldBase} placeholder="Зарплата, фриланс…" {...register('source')} /></Field>
      <Field label="Дата"><input style={fieldBase} type="date" {...register('date')} /></Field>
      <Field label="Заметка"><textarea style={{ ...fieldBase,resize:'none',minHeight:64 }} placeholder="Необязательно…" {...register('note')} /></Field>
      <Btn type="submit" size="full" style={{ marginTop:4 }}>{initial?'Сохранить':'Добавить доход'}</Btn>
    </form>
  )
}

export default function IncomePage() {
  const uid = useUserId()
  const { incomes, remove, load, loaded } = useIncomeStore()
  const { settings } = useSettingsStore()
  const base = settings.baseCurrency
  const [sheet, setSheet] = useState(false)
  const [editing, setEditing] = useState<Income|null>(null)

  useEffect(() => { if (!loaded) load(uid) }, [uid, loaded])

  const sorted = [...incomes].sort((a,b)=>b.date.localeCompare(a.date))

  return (
    <Page title="Доходы">
      <div style={{ padding:'8px 20px 16px',display:'flex',gap:10 }}>
        <StatCard label="Этот месяц" value={fmt(monthlyIncome(incomes,base),base)} color="green" icon="↑" />
        <StatCard label="Всего" value={fmt(totalIncome(incomes,base),base)} color="accent" icon="◈" />
      </div>
      <div style={{ padding:'0 20px' }}>
        <SectionHead title={`Записей: ${sorted.length}`} />
        <Card>
          {sorted.length===0 ? <Empty icon="💰" title="Нет доходов" sub="Нажмите + чтобы добавить" /> :
            sorted.map((inc,idx)=>(
              <div key={inc.id} style={{ borderBottom:idx<sorted.length-1?'1px solid var(--border)':'none' }}>
                <Row
                  left={<CatIcon color="#3DD68C" emoji="💰" />}
                  center={<div><div style={{ fontSize:14,fontWeight:600,marginBottom:2 }}>{inc.source}</div><div style={{ fontSize:12,color:'var(--text-3)' }}>{format(new Date(inc.date),'dd MMM yyyy')}{inc.note&&` · ${inc.note}`}</div></div>}
                  right={<div style={{ fontFamily:'var(--mono)',fontWeight:700,fontSize:15,color:'var(--green)' }}>+{fmt(inc.amount,inc.currency)}</div>}
                  onEdit={()=>{setEditing(inc);setSheet(true)}}
                  onDelete={()=>remove(inc.id, uid)}
                />
              </div>
            ))
          }
        </Card>
      </div>
      <FAB onClick={()=>{setEditing(null);setSheet(true)}} />
      <BottomSheet open={sheet} onClose={()=>{setSheet(false);setEditing(null)}} title={editing?'Изменить доход':'Новый доход'}>
        <IncomeForm initial={editing||undefined} onClose={()=>{setSheet(false);setEditing(null)}} />
      </BottomSheet>
    </Page>
  )
}
