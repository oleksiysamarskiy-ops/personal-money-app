import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { useSavingsStore } from './store'
import { SavingsEntry, Currency } from '@/types'
import { BottomSheet, Btn, Field, fieldBase, Row, CatIcon, Empty, FAB, Card, SectionHead, Page, StatCard } from '@/components/ui'
import { useSettingsStore } from '@/store/settings'
import { useIncomeStore } from '@/features/income/store'
import { useExpenseStore } from '@/features/expenses/store'
import { useDebtStore } from '@/features/debts/store'
import { totalSavings, monthlySavings, calcFreeCash, financialCushion } from '@/utils/selectors'
import { fmt } from '@/utils/currency'
import { format } from 'date-fns'

const CURRENCIES = ['USD','EUR','PLN','UAH','GBP'] as Currency[]
const schema = z.object({
  amount: z.number().positive('Введите сумму'),
  currency: z.enum(['USD','EUR','PLN','UAH','GBP'] as const),
  note: z.string().optional(),
  date: z.string(),
})
type FormData = z.infer<typeof schema>

function SavingsForm({ initial, onClose }: { initial?: SavingsEntry; onClose: () => void }) {
  const { add, update } = useSavingsStore()
  const { register, handleSubmit, formState:{errors} } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? { amount:initial.amount, currency:initial.currency, note:initial.note, date:initial.date }
      : { currency:'USD', date:new Date().toISOString().slice(0,10) },
  })
  const submit = (data: FormData) => {
    if (initial) update({ ...initial, ...data })
    else add({ id:uuid(), createdAt:new Date().toISOString(), amount:data.amount, currency:data.currency, note:data.note, date:data.date })
    onClose()
  }
  return (
    <form onSubmit={handleSubmit(submit)} style={{ display:'flex',flexDirection:'column',gap:14 }}>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 100px',gap:10 }}>
        <Field label="Сумма" error={errors.amount?.message}>
          <input style={fieldBase} type="number" step="0.01" placeholder="0" inputMode="decimal" {...register('amount',{valueAsNumber:true})} />
        </Field>
        <Field label="Валюта">
          <select style={{ ...fieldBase,paddingRight:8 }} {...register('currency')}>
            {CURRENCIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Дата"><input style={fieldBase} type="date" {...register('date')} /></Field>
      <Field label="Цель / заметка">
        <textarea style={{ ...fieldBase,resize:'none',minHeight:64 }} placeholder="Резервный фонд, отпуск…" {...register('note')} />
      </Field>
      <Btn type="submit" size="full" style={{ marginTop:4 }}>{initial?'Сохранить':'Отложить деньги'}</Btn>
    </form>
  )
}

export default function SavingsPage() {
  const { entries, remove } = useSavingsStore()
  const { incomes } = useIncomeStore()
  const { expenses } = useExpenseStore()
  const { debts } = useDebtStore()
  const { settings } = useSettingsStore()
  const base = settings.baseCurrency
  const [sheet, setSheet] = useState(false)
  const [editing, setEditing] = useState<SavingsEntry|null>(null)

  const totalSav = totalSavings(entries, base)
  const monthlySav = monthlySavings(entries, base)
  const freeCash = calcFreeCash(incomes, expenses, entries, debts, base)
  const cushion = financialCushion(entries, expenses, base)
  const sorted = [...entries].sort((a,b)=>b.date.localeCompare(a.date))

  return (
    <Page title="Сбережения">
      <div style={{ padding:'8px 20px 12px',display:'flex',gap:10 }}>
        <StatCard label="Накоплено" value={fmt(totalSav,base)} color="yellow" icon="🏦" />
        <StatCard label="Этот месяц" value={fmt(monthlySav,base)} color="accent" icon="📅" />
      </div>

      <div style={{ padding:'0 20px 12px' }}>
        <div style={{ background:'var(--bg-card)',border:`1px solid ${freeCash>=0?'rgba(61,214,140,0.2)':'rgba(242,85,90,0.2)'}`,borderRadius:'var(--radius)',padding:'18px' }}>
          <div style={{ fontSize:11,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6 }}>Свободные средства</div>
          <div style={{ fontSize:34,fontWeight:800,fontFamily:'var(--mono)',letterSpacing:'-0.04em',color:freeCash>=0?'var(--green)':'var(--red)' }}>
            {freeCash>=0?'+':''}{fmt(freeCash,base)}
          </div>
          <div style={{ fontSize:11,color:'var(--text-3)',marginTop:6 }}>доходы − расходы − сбережения − долги</div>
        </div>
      </div>

      {cushion > 0 && (
        <div style={{ padding:'0 20px 16px' }}>
          <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px 18px' }}>
            <div style={{ fontSize:11,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8 }}>Финансовая подушка</div>
            <div style={{ fontSize:28,fontWeight:700,fontFamily:'var(--mono)',color:'var(--yellow)',letterSpacing:'-0.03em' }}>{cushion.toFixed(1)} мес.</div>
            <div style={{ marginTop:10,height:5,background:'var(--bg-input)',borderRadius:3,overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${Math.min(100,cushion/12*100)}%`,background:cushion>=6?'var(--green)':cushion>=3?'var(--yellow)':'var(--red)',borderRadius:3 }} />
            </div>
            <div style={{ fontSize:11,color:'var(--text-3)',marginTop:5 }}>
              {cushion>=6?'Отличная подушка ✓':cushion>=3?'Хорошо, цель — 6 мес.':'Рекомендуется минимум 3 мес.'}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding:'0 20px' }}>
        <SectionHead title={`Транзакций: ${sorted.length}`} />
        <Card>
          {sorted.length===0
            ? <Empty icon="🏦" title="Нет сбережений" sub="Нажмите + чтобы отложить деньги" />
            : sorted.map((e,idx)=>(
              <div key={e.id} style={{ borderBottom:idx<sorted.length-1?'1px solid var(--border)':'none' }}>
                <Row
                  left={<CatIcon color="#F5A623" emoji="🏦" />}
                  center={<div><div style={{ fontSize:14,fontWeight:600,marginBottom:2 }}>{e.note||'Сбережения'}</div><div style={{ fontSize:12,color:'var(--text-3)' }}>{format(new Date(e.date),'dd MMM yyyy')}</div></div>}
                  right={<div style={{ fontFamily:'var(--mono)',fontWeight:700,fontSize:15,color:'var(--yellow)' }}>{fmt(e.amount,e.currency)}</div>}
                  onEdit={()=>{setEditing(e);setSheet(true)}}
                  onDelete={()=>remove(e.id)}
                />
              </div>
            ))
          }
        </Card>
      </div>
      <FAB onClick={()=>{setEditing(null);setSheet(true)}} />
      <BottomSheet open={sheet} onClose={()=>{setSheet(false);setEditing(null)}} title={editing?'Изменить':'Отложить деньги'}>
        <SavingsForm key={editing?.id || "new"} initial={editing||undefined} onClose={()=>{setSheet(false);setEditing(null)}} />
      </BottomSheet>
    </Page>
  )
}
