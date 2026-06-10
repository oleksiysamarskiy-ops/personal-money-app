import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { useDebtStore } from './store'
import { Debt, DebtPayment, Currency } from '@/types'
import { BottomSheet, Btn, Field, fieldBase, Row, CatIcon, Empty, FAB, Card, SectionHead, Page, StatCard, SegmentControl } from '@/components/ui'
import { useSettingsStore } from '@/store/settings'
import { totalIOwe, totalOwedToMe, debtRemaining } from '@/utils/selectors'
import { fmt } from '@/utils/currency'
import { format } from 'date-fns'

const CURRENCIES = ['USD','EUR','PLN','UAH','GBP'] as Currency[]

const debtSchema = z.object({
  direction: z.enum(['i_owe','owed_to_me']),
  name: z.string().min(1,'Введите имя'),
  amount: z.number().positive('Введите сумму'),
  currency: z.enum(['USD','EUR','PLN','UAH','GBP'] as const),
  note: z.string().optional(),
  dueDate: z.string().optional(),
})
type DebtForm = z.infer<typeof debtSchema>

const paymentSchema = z.object({
  amount: z.number().positive('Введите сумму'),
  date: z.string(),
  note: z.string().optional(),
})
type PaymentForm = z.infer<typeof paymentSchema>

function DebtFormComp({ initial, defaultDir, onClose }: { initial?: Debt; defaultDir: 'i_owe'|'owed_to_me'; onClose:()=>void }) {
  const { add, update } = useDebtStore()
  const { register, handleSubmit, formState:{errors} } = useForm<DebtForm>({
    resolver: zodResolver(debtSchema),
    defaultValues: initial
      ? { direction:initial.direction, name:initial.name, amount:initial.amount, currency:initial.currency, note:initial.note, dueDate:initial.dueDate }
      : { direction:defaultDir, currency:'USD' },
  })
  const submit = (data: DebtForm) => {
    if (initial) update({ ...initial, ...data })
    else add({ id:uuid(), createdAt:new Date().toISOString(), payments:[], ...data })
    onClose()
  }
  return (
    <form onSubmit={handleSubmit(submit)} style={{ display:'flex',flexDirection:'column',gap:14 }}>
      <Field label="Имя / название" error={errors.name?.message}>
        <input style={fieldBase} placeholder="Иван, банк…" {...register('name')} />
      </Field>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 100px',gap:10 }}>
        <Field label="Сумма" error={errors.amount?.message}>
          <input style={fieldBase} type="number" step="0.01" inputMode="decimal" {...register('amount',{valueAsNumber:true})} />
        </Field>
        <Field label="Валюта">
          <select style={{ ...fieldBase,paddingRight:8 }} {...register('currency')}>
            {CURRENCIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Срок погашения (необязательно)">
        <input style={fieldBase} type="date" {...register('dueDate')} />
      </Field>
      <Field label="Заметка">
        <textarea style={{ ...fieldBase,resize:'none',minHeight:64 }} placeholder="Необязательно…" {...register('note')} />
      </Field>
      <Btn type="submit" size="full" style={{ marginTop:4 }}>{initial?'Сохранить':'Добавить долг'}</Btn>
    </form>
  )
}

function PaymentFormComp({ debt, onClose }: { debt: Debt; onClose:()=>void }) {
  const { addPayment } = useDebtStore()
  const { register, handleSubmit, formState:{errors} } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { date:new Date().toISOString().slice(0,10) },
  })
  const submit = (data: PaymentForm) => {
    addPayment(debt.id, { id:uuid(), ...data })
    onClose()
  }
  return (
    <form onSubmit={handleSubmit(submit)} style={{ display:'flex',flexDirection:'column',gap:14 }}>
      <Field label={`Сумма (${debt.currency})`} error={errors.amount?.message}>
        <input style={fieldBase} type="number" step="0.01" inputMode="decimal" {...register('amount',{valueAsNumber:true})} />
      </Field>
      <Field label="Дата"><input style={fieldBase} type="date" {...register('date')} /></Field>
      <Field label="Заметка"><input style={fieldBase} placeholder="Частичная оплата…" {...register('note')} /></Field>
      <Btn type="submit" size="full" style={{ marginTop:4 }}>Записать платёж</Btn>
    </form>
  )
}

function DebtCard({ debt, base, onEdit, onDelete, onPay }: { debt:Debt; base:Currency; onEdit:()=>void; onDelete:()=>void; onPay:()=>void }) {
  const remaining = debtRemaining(debt, base)
  const total = debt.amount
  const paid = debt.payments.reduce((s,p)=>s+p.amount,0)
  const pct = total>0 ? Math.min(100,(paid/total)*100) : 0
  const isIOwe = debt.direction==='i_owe'
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom:'1px solid var(--border)' }}>
      <div onClick={()=>setOpen(v=>!v)} style={{ padding:'14px 16px',cursor:'pointer',background:open?'var(--bg-active)':'transparent' }}>
        <div style={{ display:'flex',alignItems:'flex-start',gap:12 }}>
          <CatIcon color={isIOwe?'#F2555A':'#3DD68C'} emoji={isIOwe?'😬':'🤜'} />
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:14,fontWeight:600,marginBottom:2 }}>{debt.name}</div>
            <div style={{ fontSize:12,color:'var(--text-3)' }}>
              {debt.dueDate && `до ${format(new Date(debt.dueDate),'dd MMM yyyy')} · `}
              {debt.payments.length} платежей
            </div>
            <div style={{ marginTop:8,height:4,background:'var(--bg-input)',borderRadius:2,overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${pct}%`,background:isIOwe?'var(--red)':'var(--green)',borderRadius:2 }} />
            </div>
            <div style={{ fontSize:11,color:'var(--text-3)',marginTop:4 }}>
              Погашено: {fmt(paid,debt.currency)} из {fmt(total,debt.currency)}
            </div>
          </div>
          <div style={{ textAlign:'right',flexShrink:0 }}>
            <div style={{ fontFamily:'var(--mono)',fontWeight:700,fontSize:15,color:isIOwe?'var(--red)':'var(--green)' }}>
              {fmt(remaining,base)}
            </div>
            <div style={{ fontSize:11,color:'var(--text-3)',marginTop:2 }}>осталось</div>
          </div>
        </div>
      </div>
      {open && (
        <div style={{ borderTop:'1px solid var(--border)',background:'var(--bg-active)' }}>
          {debt.payments.length>0 && (
            <div style={{ padding:'10px 16px' }}>
              {debt.payments.slice(-3).map(p=>(
                <div key={p.id} style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text-3)',padding:'3px 0' }}>
                  <span>{format(new Date(p.date),'dd MMM')}{p.note?` · ${p.note}`:''}</span>
                  <span style={{ fontFamily:'var(--mono)',color:'var(--text-2)' }}>-{fmt(p.amount,debt.currency)}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:'flex',borderTop:'1px solid var(--border)' }}>
            <button onClick={()=>{onPay();setOpen(false)}} style={{ flex:1,padding:'10px',border:'none',background:'none',color:'var(--green)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'var(--font)' }}>+ Платёж</button>
            <div style={{ width:1,background:'var(--border)' }} />
            <button onClick={()=>{onEdit();setOpen(false)}} style={{ flex:1,padding:'10px',border:'none',background:'none',color:'var(--accent-2)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'var(--font)' }}>Изменить</button>
            <div style={{ width:1,background:'var(--border)' }} />
            <button onClick={()=>{onDelete();setOpen(false)}} style={{ flex:1,padding:'10px',border:'none',background:'none',color:'var(--red)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'var(--font)' }}>Удалить</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DebtsPage() {
  const { debts, remove } = useDebtStore()
  const { settings } = useSettingsStore()
  const base = settings.baseCurrency
  const [tab, setTab] = useState<'i_owe'|'owed_to_me'>('i_owe')
  const [sheet, setSheet] = useState<'debt'|'payment'|null>(null)
  const [editing, setEditing] = useState<Debt|null>(null)
  const [payingDebt, setPayingDebt] = useState<Debt|null>(null)

  const iOwe = debts.filter(d=>d.direction==='i_owe')
  const owedToMe = debts.filter(d=>d.direction==='owed_to_me')
  const filtered = tab==='i_owe' ? iOwe : owedToMe

  return (
    <Page title="Долги">
      <div style={{ padding:'8px 20px 16px',display:'flex',gap:10 }}>
        <StatCard label="Я должен" value={fmt(totalIOwe(debts,base),base)} color="red" icon="😬" />
        <StatCard label="Мне должны" value={fmt(totalOwedToMe(debts,base),base)} color="green" icon="🤜" />
      </div>

      <div style={{ padding:'0 20px 16px' }}>
        <SegmentControl
          options={[{label:`Я должен (${iOwe.length})`,value:'i_owe'},{label:`Мне должны (${owedToMe.length})`,value:'owed_to_me'}]}
          value={tab} onChange={v=>setTab(v as 'i_owe'|'owed_to_me')}
        />
      </div>

      <div style={{ padding:'0 20px' }}>
        <Card>
          {filtered.length===0
            ? <Empty icon={tab==='i_owe'?'😮‍💨':'🤝'} title="Нет долгов" sub="Нажмите + чтобы добавить" />
            : filtered.map(d=>(
              <DebtCard
                key={d.id} debt={d} base={base}
                onEdit={()=>{setEditing(d);setSheet('debt')}}
                onDelete={()=>remove(d.id)}
                onPay={()=>{setPayingDebt(d);setSheet('payment')}}
              />
            ))
          }
        </Card>
      </div>

      <FAB onClick={()=>{setEditing(null);setSheet('debt')}} />

      <BottomSheet open={sheet==='debt'} onClose={()=>{setSheet(null);setEditing(null)}} title={editing?'Изменить долг':'Новый долг'}>
        <DebtFormComp initial={editing||undefined} defaultDir={tab} onClose={()=>{setSheet(null);setEditing(null)}} />
      </BottomSheet>

      <BottomSheet open={sheet==='payment'} onClose={()=>{setSheet(null);setPayingDebt(null)}} title={`Платёж: ${payingDebt?.name||''}`}>
        {payingDebt && <PaymentFormComp debt={payingDebt} onClose={()=>{setSheet(null);setPayingDebt(null)}} />}
      </BottomSheet>
    </Page>
  )
}
