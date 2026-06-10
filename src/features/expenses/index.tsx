import { useExpenseStore, useIncomeStore, useSavingsStore, useInvestmentStore, useDebtStore, useSubscriptionStore, useSettingsStore } from '@/store/hooks'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { Expense, Currency } from '@/types'
import { BottomSheet, Btn, Field, fieldBase, Row, CatIcon, Empty, FAB, Card, SectionHead, Page, StatCard } from '@/components/ui'
import { totalExpenses, monthlyExpenses, expensesByCategory } from '@/utils/selectors'
import { fmt } from '@/utils/currency'
import { format } from 'date-fns'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const CATS = [
  { v:'Еда', e:'🍔', c:'#F5A623' },{ v:'Транспорт', e:'🚗', c:'#4A9EFF' },
  { v:'Жильё', e:'🏠', c:'#3DD68C' },{ v:'Здоровье', e:'💊', c:'#F2555A' },
  { v:'Развлечения', e:'🎮', c:'#A855F7' },{ v:'Покупки', e:'🛍️', c:'#EC4899' },
  { v:'Образование', e:'📚', c:'#5B5BD6' },{ v:'Путешествия', e:'✈️', c:'#06B6D4' },
  { v:'Подписки', e:'📱', c:'#F97316' },{ v:'Прочее', e:'📦', c:'#6B7280' },
]
const getCat = (v:string) => CATS.find(c=>c.v===v)||CATS[CATS.length-1]

const schema = z.object({
  amount: z.number().positive('Введите сумму'),
  currency: z.enum(['USD','EUR','PLN','UAH','GBP'] as const),
  category: z.string(),
  note: z.string().optional(),
  date: z.string(),
})
type FormData = z.infer<typeof schema>

function ExpenseForm({ initial, onClose }: { initial?: Expense; onClose: () => void }) {
  const { add, update } = useExpenseStore()
  const { register, handleSubmit, formState:{errors} } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial ? { amount:initial.amount, currency:initial.currency, category:initial.category, note:initial.note, date:initial.date } : { currency:'USD', category:'Еда', date:new Date().toISOString().slice(0,10) },
  })
  const submit = (data: FormData) => {
    if (initial) update({ ...initial, ...data })
    else add({ id:uuid(), createdAt:new Date().toISOString(), amount:data.amount, currency:data.currency, category:data.category, note:data.note, date:data.date })
    onClose()
  }
  return (
    <form onSubmit={handleSubmit(submit)} style={{ display:'flex',flexDirection:'column',gap:14 }}>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 100px',gap:10 }}>
        <Field label="Сумма" error={errors.amount?.message}><input style={fieldBase} type="number" step="0.01" placeholder="0" inputMode="decimal" {...register('amount',{valueAsNumber:true})} /></Field>
        <Field label="Валюта"><select style={{ ...fieldBase,paddingRight:8 }} {...register('currency')}>{(['USD','EUR','PLN','UAH','GBP'] as Currency[]).map(c=><option key={c}>{c}</option>)}</select></Field>
      </div>
      <Field label="Категория">
        <select style={{ ...fieldBase,paddingRight:8 }} {...register('category')}>
          {CATS.map(c=><option key={c.v} value={c.v}>{c.e} {c.v}</option>)}
        </select>
      </Field>
      <Field label="Дата"><input style={fieldBase} type="date" {...register('date')} /></Field>
      <Field label="Заметка"><textarea style={{ ...fieldBase,resize:'none',minHeight:64 }} placeholder="Необязательно…" {...register('note')} /></Field>
      <Btn type="submit" size="full" style={{ marginTop:4 }}>{initial?'Сохранить':'Добавить расход'}</Btn>
    </form>
  )
}

export default function ExpensesPage() {
  const { expenses, remove } = useExpenseStore()
  const { settings } = useSettingsStore()
  const base = settings.baseCurrency
  const [sheet, setSheet] = useState(false)
  const [editing, setEditing] = useState<Expense|null>(null)
  const [catFilter, setCatFilter] = useState('')

  const byCat = expensesByCategory(expenses, base)
  const filtered = [...expenses].filter(e=>!catFilter||e.category===catFilter).sort((a,b)=>b.date.localeCompare(a.date))

  return (
    <Page title="Расходы">
      <div style={{ padding:'8px 20px 16px',display:'flex',gap:10 }}>
        <StatCard label="Этот месяц" value={fmt(monthlyExpenses(expenses,base),base)} color="red" icon="↓" />
        <StatCard label="Всего" value={fmt(totalExpenses(expenses,base),base)} color="yellow" icon="🧾" />
      </div>

      {byCat.length>0 && (
        <div style={{ padding:'0 20px 16px' }}>
          <Card>
            <div style={{ padding:'14px 16px 0' }}><SectionHead title="По категориям" /></div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart><Pie data={byCat} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={2}>
                {byCat.map(e=><Cell key={e.name} fill={getCat(e.name).c} />)}
              </Pie>
              <Tooltip contentStyle={{ background:'#13131A',border:'1px solid #ffffff11',borderRadius:10,fontSize:12 }} formatter={(v:number)=>[fmt(v,base),'']} /></PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6,padding:'0 16px 14px' }}>
              {[{v:'',e:'',c:''},...CATS.filter(c=>byCat.find(b=>b.name===c.v))].map(c=>(
                <button key={c.v} onClick={()=>setCatFilter(c.v===catFilter?'':c.v)} style={{ padding:'5px 10px',borderRadius:20,border:`1px solid ${catFilter===c.v&&c.v?c.c:'var(--border)'}`,background:catFilter===c.v&&c.v?`${c.c}22`:'var(--bg-input)',color:catFilter===c.v&&c.v?c.c:'var(--text-2)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'var(--font)' }}>
                  {c.v?`${c.e} ${c.v}`:'Все'}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div style={{ padding:'0 20px' }}>
        <SectionHead title={`Записей: ${filtered.length}`} />
        <Card>
          {filtered.length===0 ? <Empty icon="🧾" title="Нет расходов" sub="Нажмите + чтобы добавить" /> :
            filtered.map((exp,idx)=>{
              const cat=getCat(exp.category)
              return (
                <div key={exp.id} style={{ borderBottom:idx<filtered.length-1?'1px solid var(--border)':'none' }}>
                  <Row
                    left={<CatIcon color={cat.c} emoji={cat.e} />}
                    center={<div><div style={{ fontSize:14,fontWeight:600,marginBottom:2 }}>{exp.category}</div><div style={{ fontSize:12,color:'var(--text-3)' }}>{format(new Date(exp.date),'dd MMM yyyy')}{exp.note&&` · ${exp.note}`}</div></div>}
                    right={<div style={{ fontFamily:'var(--mono)',fontWeight:700,fontSize:15,color:'var(--red)' }}>-{fmt(exp.amount,exp.currency)}</div>}
                    onEdit={()=>{setEditing(exp);setSheet(true)}}
                    onDelete={()=>remove(exp.id)}
                  />
                </div>
              )
            })
          }
        </Card>
      </div>
      <FAB onClick={()=>{setEditing(null);setSheet(true)}} />
      <BottomSheet open={sheet} onClose={()=>{setSheet(false);setEditing(null)}} title={editing?'Изменить расход':'Новый расход'}>
        <ExpenseForm initial={editing||undefined} onClose={()=>{setSheet(false);setEditing(null)}} />
      </BottomSheet>
    </Page>
  )
}
