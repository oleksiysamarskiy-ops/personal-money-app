import { useSubscriptionStore } from "./store"
import { useSettingsStore } from "@/store/settings"
import { useUserId } from "@/store/userContext"
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { Subscription, Currency, BillingCycle } from '@/types'
import { BottomSheet, Btn, Field, fieldBase, Row, CatIcon, Empty, FAB, Card, SectionHead, Page, StatCard } from '@/components/ui'
import { toBase, fmt } from '@/utils/currency'
import { daysUntil } from '@/utils/date'
import { format } from 'date-fns'

const CURRENCIES = ['USD','EUR','PLN','UAH','GBP'] as Currency[]
const CYCLES: {v:BillingCycle;l:string}[] = [{v:'monthly',l:'Ежемесячно'},{v:'yearly',l:'Ежегодно'},{v:'weekly',l:'Еженедельно'}]

const schema = z.object({
  name: z.string().min(1,'Введите название'),
  price: z.number().positive('Введите цену'),
  currency: z.enum(['USD','EUR','PLN','UAH','GBP'] as const),
  nextBillingDate: z.string(),
  billingCycle: z.enum(['monthly','yearly','weekly'] as const),
  note: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const SUB_ICONS: Record<string,string> = {
  'spotify':'🎵','netflix':'🎬','chatgpt':'🤖','openai':'🤖',
  'youtube':'▶️','apple':'🍎','google':'🔍','amazon':'📦',
  'github':'🐙','figma':'🎨','notion':'📝','default':'📱',
}
function getIcon(name: string): string {
  const key = name.toLowerCase()
  for (const [k,v] of Object.entries(SUB_ICONS)) if (key.includes(k)) return v
  return SUB_ICONS.default
}

function SubForm({ initial, onClose }: { initial?: Subscription; onClose:()=>void }) {
  const uid = useUserId()
  const { add, update } = useSubscriptionStore()
  const { register, handleSubmit, formState:{errors} } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? { name:initial.name, price:initial.price, currency:initial.currency, nextBillingDate:initial.nextBillingDate, billingCycle:initial.billingCycle, note:initial.note }
      : { currency:'USD', billingCycle:'monthly', nextBillingDate:new Date().toISOString().slice(0,10) },
  })
  const submit = (data: FormData) => {
    if (initial) update({ ...initial, ...data }, uid)
    else add({ id:uuid(), createdAt:new Date().toISOString(), name:data.name, price:data.price, currency:data.currency, nextBillingDate:data.nextBillingDate, billingCycle:data.billingCycle, note:data.note }, uid)
    onClose()
  }
  return (
    <form onSubmit={handleSubmit(submit)} style={{ display:'flex',flexDirection:'column',gap:14 }}>
      <Field label="Название" error={errors.name?.message}>
        <input style={fieldBase} placeholder="Spotify, Netflix…" {...register('name')} />
      </Field>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 100px',gap:10 }}>
        <Field label="Цена" error={errors.price?.message}>
          <input style={fieldBase} type="number" step="0.01" inputMode="decimal" {...register('price',{valueAsNumber:true})} />
        </Field>
        <Field label="Валюта">
          <select style={{ ...fieldBase,paddingRight:8 }} {...register('currency')}>
            {CURRENCIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Периодичность">
        <select style={{ ...fieldBase,paddingRight:8 }} {...register('billingCycle')}>
          {CYCLES.map(c=><option key={c.v} value={c.v}>{c.l}</option>)}
        </select>
      </Field>
      <Field label="Следующее списание">
        <input style={fieldBase} type="date" {...register('nextBillingDate')} />
      </Field>
      <Field label="Заметка">
        <input style={fieldBase} placeholder="Необязательно…" {...register('note')} />
      </Field>
      <Btn type="submit" size="full" style={{ marginTop:4 }}>{initial?'Сохранить':'Добавить подписку'}</Btn>
    </form>
  )
}

export default function SubscriptionsPage() {
  const uid = useUserId()
  const { subscriptions, remove, load, loaded } = useSubscriptionStore()
  const { settings } = useSettingsStore()
  const base = settings.baseCurrency
  const [sheet, setSheet] = useState(false)
  const [editing, setEditing] = useState<Subscription|null>(null)

  useEffect(() => { if (!loaded) load(uid) }, [uid, loaded])

  const sorted = [...subscriptions]
    .map(s=>({ ...s, days: s.nextBillingDate ? daysUntil(s.nextBillingDate) : 999 }))
    .sort((a,b)=>a.days-b.days)

  const monthlyTotal = subscriptions.reduce((sum,s) => {
    const monthly = s.billingCycle==='yearly' ? s.price/12 : s.billingCycle==='weekly' ? s.price*4.33 : s.price
    return sum + toBase(monthly, s.currency, base)
  }, 0)

  const cycleLabel: Record<BillingCycle,string> = { monthly:'мес.', yearly:'год', weekly:'нед.' }

  return (
    <Page title="Подписки">
      <div style={{ padding:'8px 20px 16px',display:'flex',gap:10 }}>
        <StatCard label="В месяц (≈)" value={fmt(monthlyTotal,base)} color="accent" icon="📱" />
        <StatCard label="Подписок" value={String(subscriptions.length)} color="blue" icon="📋" />
      </div>

      <div style={{ padding:'0 20px' }}>
        <SectionHead title="Ближайшие списания" />
        <Card>
          {sorted.length===0
            ? <Empty icon="📱" title="Нет подписок" sub="Нажмите + чтобы добавить" />
            : sorted.map((s,idx)=>{
              const urgent = s.days<=3
              const soon = s.days<=7
              return (
                <div key={s.id} style={{ borderBottom:idx<sorted.length-1?'1px solid var(--border)':'none' }}>
                  <Row
                    left={<CatIcon color={urgent?'#F2555A':soon?'#F5A623':'#5B5BD6'} emoji={getIcon(s.name)} />}
                    center={
                      <div>
                        <div style={{ fontSize:14,fontWeight:600,marginBottom:2 }}>{s.name}</div>
                        <div style={{ fontSize:12,color:'var(--text-3)' }}>
                          {fmt(s.price,s.currency)}/{cycleLabel[s.billingCycle]} · {format(new Date(s.nextBillingDate),'dd MMM')}
                        </div>
                      </div>
                    }
                    right={
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:13,fontWeight:700,color:urgent?'var(--red)':soon?'var(--yellow)':'var(--text-2)' }}>
                          {s.days===0?'Сегодня':s.days<0?'Просрочен':`${s.days} дн.`}
                        </div>
                      </div>
                    }
                    onEdit={()=>{setEditing(s);setSheet(true)}}
                    onDelete={()=>remove(s.id, uid)}
                  />
                </div>
              )
            })
          }
        </Card>
      </div>

      <FAB onClick={()=>{setEditing(null);setSheet(true)}} />
      <BottomSheet open={sheet} onClose={()=>{setSheet(false);setEditing(null)}} title={editing?'Изменить подписку':'Новая подписка'}>
        <SubForm initial={editing||undefined} onClose={()=>{setSheet(false);setEditing(null)}} />
      </BottomSheet>
    </Page>
  )
}
