import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { useInvestmentStore } from './store'
import { Investment, CryptoInvestment, StakingInvestment, FixedInvestment, Currency } from '@/types'
import { BottomSheet, Btn, Field, fieldBase, Empty, FAB, Card, SectionHead, Page, StatCard, SegmentControl, Row, CatIcon } from '@/components/ui'
import { useSettingsStore } from '@/store/settings'
import { calcCryptoValue, calcStakingValue, calcFixedValue, totalInvestments } from '@/utils/selectors'
import { fmt } from '@/utils/currency'
import { format, differenceInDays } from 'date-fns'

const CURRENCIES = ['USD','EUR','PLN','UAH','GBP'] as Currency[]

async function fetchPrices(symbols: string[]): Promise<Record<string,number>> {
  if (!symbols.length) return {}
  try {
    const ids = symbols.map(s=>s.toLowerCase()).join(',')
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
    if (!res.ok) return {}
    const data = await res.json()
    const result: Record<string,number> = {}
    symbols.forEach(s=>{ if (data[s.toLowerCase()]) result[s.toUpperCase()]=data[s.toLowerCase()].usd })
    return result
  } catch { return {} }
}

const cryptoSchema = z.object({
  coinName: z.string().min(1), symbol: z.string().min(1),
  quantity: z.number().positive(), purchasePrice: z.number().positive(),
  currency: z.enum(['USD','EUR','PLN','UAH','GBP'] as const), purchaseDate: z.string(),
})
const stakingSchema = z.object({
  name: z.string().min(1), principal: z.number().positive(),
  currency: z.enum(['USD','EUR','PLN','UAH','GBP'] as const),
  apr: z.number().positive(), startDate: z.string(), endDate: z.string(),
})
const fixedSchema = z.object({
  name: z.string().min(1), principal: z.number().positive(),
  currency: z.enum(['USD','EUR','PLN','UAH','GBP'] as const),
  interestRate: z.number().positive(), startDate: z.string(), endDate: z.string(),
})

function CryptoForm({ initial, onClose }: { initial?: CryptoInvestment; onClose:()=>void }) {
  const { add, update } = useInvestmentStore()
  const { register, handleSubmit, formState:{errors} } = useForm<z.infer<typeof cryptoSchema>>({
    resolver: zodResolver(cryptoSchema),
    defaultValues: initial || { currency:'USD', purchaseDate:new Date().toISOString().slice(0,10) },
  })
  const submit = (data: z.infer<typeof cryptoSchema>) => {
    if (initial) update({ ...initial, type:'crypto' as const, coinName:data.coinName, symbol:data.symbol, quantity:data.quantity, purchasePrice:data.purchasePrice, currency:data.currency, purchaseDate:data.purchaseDate })
    else add({ id:uuid(), type:'crypto' as const, createdAt:new Date().toISOString(), coinName:data.coinName, symbol:data.symbol, quantity:data.quantity, purchasePrice:data.purchasePrice, currency:data.currency, purchaseDate:data.purchaseDate })
    onClose()
  }
  return (
    <form onSubmit={handleSubmit(submit)} style={{ display:'flex',flexDirection:'column',gap:14 }}>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
        <Field label="Монета (CoinGecko ID)" error={errors.coinName?.message}><input style={fieldBase} placeholder="bitcoin" {...register('coinName')} /></Field>
        <Field label="Символ" error={errors.symbol?.message}><input style={fieldBase} placeholder="BTC" {...register('symbol')} /></Field>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
        <Field label="Количество"><input style={fieldBase} type="number" step="any" inputMode="decimal" {...register('quantity',{valueAsNumber:true})} /></Field>
        <Field label="Цена покупки"><input style={fieldBase} type="number" step="any" inputMode="decimal" {...register('purchasePrice',{valueAsNumber:true})} /></Field>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
        <Field label="Валюта"><select style={{ ...fieldBase,paddingRight:8 }} {...register('currency')}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></Field>
        <Field label="Дата покупки"><input style={fieldBase} type="date" {...register('purchaseDate')} /></Field>
      </div>
      <Btn type="submit" size="full" style={{ marginTop:4 }}>{initial?'Сохранить':'Добавить'}</Btn>
    </form>
  )
}

function StakingForm({ initial, onClose }: { initial?: StakingInvestment; onClose:()=>void }) {
  const { add, update } = useInvestmentStore()
  const { register, handleSubmit, formState:{errors} } = useForm<z.infer<typeof stakingSchema>>({
    resolver: zodResolver(stakingSchema),
    defaultValues: initial || { currency:'USD', startDate:new Date().toISOString().slice(0,10) },
  })
  const submit = (data: z.infer<typeof stakingSchema>) => {
    if (initial) update({ ...initial, type:'staking' as const, name:data.name, principal:data.principal, currency:data.currency, apr:data.apr, startDate:data.startDate, endDate:data.endDate })
    else add({ id:uuid(), type:'staking' as const, createdAt:new Date().toISOString(), name:data.name, principal:data.principal, currency:data.currency, apr:data.apr, startDate:data.startDate, endDate:data.endDate })
    onClose()
  }
  return (
    <form onSubmit={handleSubmit(submit)} style={{ display:'flex',flexDirection:'column',gap:14 }}>
      <Field label="Название" error={errors.name?.message}><input style={fieldBase} placeholder="ETH Staking" {...register('name')} /></Field>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 100px',gap:10 }}>
        <Field label="Сумма"><input style={fieldBase} type="number" step="any" inputMode="decimal" {...register('principal',{valueAsNumber:true})} /></Field>
        <Field label="Валюта"><select style={{ ...fieldBase,paddingRight:8 }} {...register('currency')}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></Field>
      </div>
      <Field label="APR (%/год)"><input style={fieldBase} type="number" step="0.1" inputMode="decimal" placeholder="12.5" {...register('apr',{valueAsNumber:true})} /></Field>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
        <Field label="Начало"><input style={fieldBase} type="date" {...register('startDate')} /></Field>
        <Field label="Конец"><input style={fieldBase} type="date" {...register('endDate')} /></Field>
      </div>
      <Btn type="submit" size="full" style={{ marginTop:4 }}>{initial?'Сохранить':'Добавить'}</Btn>
    </form>
  )
}

function FixedForm({ initial, onClose }: { initial?: FixedInvestment; onClose:()=>void }) {
  const { add, update } = useInvestmentStore()
  const { register, handleSubmit, formState:{errors} } = useForm<z.infer<typeof fixedSchema>>({
    resolver: zodResolver(fixedSchema),
    defaultValues: initial || { currency:'USD', startDate:new Date().toISOString().slice(0,10) },
  })
  const submit = (data: z.infer<typeof fixedSchema>) => {
    if (initial) update({ ...initial, type:'fixed' as const, name:data.name, principal:data.principal, currency:data.currency, interestRate:data.interestRate, startDate:data.startDate, endDate:data.endDate })
    else add({ id:uuid(), type:'fixed' as const, createdAt:new Date().toISOString(), name:data.name, principal:data.principal, currency:data.currency, interestRate:data.interestRate, startDate:data.startDate, endDate:data.endDate })
    onClose()
  }
  return (
    <form onSubmit={handleSubmit(submit)} style={{ display:'flex',flexDirection:'column',gap:14 }}>
      <Field label="Название" error={errors.name?.message}><input style={fieldBase} placeholder="Депозит в банке" {...register('name')} /></Field>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 100px',gap:10 }}>
        <Field label="Сумма"><input style={fieldBase} type="number" step="any" inputMode="decimal" {...register('principal',{valueAsNumber:true})} /></Field>
        <Field label="Валюта"><select style={{ ...fieldBase,paddingRight:8 }} {...register('currency')}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select></Field>
      </div>
      <Field label="Ставка (%/год)"><input style={fieldBase} type="number" step="0.1" inputMode="decimal" placeholder="8.5" {...register('interestRate',{valueAsNumber:true})} /></Field>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
        <Field label="Начало"><input style={fieldBase} type="date" {...register('startDate')} /></Field>
        <Field label="Конец"><input style={fieldBase} type="date" {...register('endDate')} /></Field>
      </div>
      <Btn type="submit" size="full" style={{ marginTop:4 }}>{initial?'Сохранить':'Добавить'}</Btn>
    </form>
  )
}

export default function InvestmentsPage() {
  const { investments, remove } = useInvestmentStore()
  const { settings } = useSettingsStore()
  const base = settings.baseCurrency
  const [tab, setTab] = useState('crypto')
  const [sheet, setSheet] = useState(false)
  const [editing, setEditing] = useState<Investment|null>(null)
  const [prices, setPrices] = useState<Record<string,number>>({})

  useEffect(() => {
    const cryptos = investments.filter(i=>i.type==='crypto') as CryptoInvestment[]
    if (cryptos.length) fetchPrices(cryptos.map(c=>c.symbol)).then(setPrices)
  }, [investments])

  const byType = investments.filter(i=>i.type===tab)
  const totalVal = totalInvestments(investments, prices, base)
  const addTitle: Record<string,string> = { crypto:'Крипто', staking:'Стейкинг', fixed:'Вклад' }

  return (
    <Page title="Инвестиции">
      <div style={{ padding:'8px 20px 16px' }}>
        <StatCard label="Портфель (тек. стоимость)" value={fmt(totalVal,base)} color="purple" icon="📈" accent="var(--purple)" />
      </div>
      <div style={{ padding:'0 20px 16px' }}>
        <SegmentControl
          options={[{label:'Крипто',value:'crypto'},{label:'Стейкинг',value:'staking'},{label:'Вклады',value:'fixed'}]}
          value={tab} onChange={setTab}
        />
      </div>
      <div style={{ padding:'0 20px' }}>
        <SectionHead title={`${addTitle[tab]}: ${byType.length}`} />
        <Card>
          {byType.length===0
            ? <Empty icon="📈" title={`Нет: ${addTitle[tab]}`} sub="Нажмите + чтобы добавить" />
            : byType.map((inv,idx)=>{
              let emoji='📈'; let color='#A855F7'
              let title=''; let sub=''; let rightEl=<></>

              if (inv.type==='crypto') {
                const c=inv as CryptoInvestment
                const v=calcCryptoValue(c,prices,base)
                emoji='🪙'; color='#F5A623'
                title=`${c.coinName} (${c.symbol.toUpperCase()})`
                sub=`${c.quantity} шт · ${format(new Date(c.purchaseDate),'dd MMM yyyy')}`
                rightEl=(
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'var(--mono)',fontWeight:700,fontSize:14,color:'var(--text-num)' }}>{fmt(v.current,base)}</div>
                    <div style={{ fontSize:12,fontWeight:600,color:v.pnl>=0?'var(--green)':'var(--red)',marginTop:2 }}>{v.pnl>=0?'+':''}{fmt(v.pnl,base)} ({v.roi.toFixed(1)}%)</div>
                  </div>
                )
              } else if (inv.type==='staking') {
                const s=inv as StakingInvestment
                const v=calcStakingValue(s,base)
                const dl=differenceInDays(new Date(s.endDate),new Date())
                emoji='⚡'; color='#3DD68C'
                title=s.name; sub=`APR ${s.apr}% · ${dl>0?`${dl} дн.`:'Завершён'}`
                rightEl=(
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'var(--mono)',fontWeight:700,fontSize:14,color:'var(--text-num)' }}>{fmt(v.current,base)}</div>
                    <div style={{ fontSize:12,color:'var(--green)',marginTop:2 }}>+{fmt(v.pnl,base)}</div>
                  </div>
                )
              } else {
                const f=inv as FixedInvestment
                const v=calcFixedValue(f,base)
                const dl=differenceInDays(new Date(f.endDate),new Date())
                emoji='🏛️'; color='#4A9EFF'
                title=f.name; sub=`${f.interestRate}%/год · ${dl>0?`${dl} дн.`:'Завершён'}`
                rightEl=(
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'var(--mono)',fontWeight:700,fontSize:14,color:'var(--text-num)' }}>{fmt(v.current,base)}</div>
                    <div style={{ fontSize:12,color:'var(--green)',marginTop:2 }}>+{fmt(v.pnl,base)}</div>
                  </div>
                )
              }
              return (
                <div key={inv.id} style={{ borderBottom:idx<byType.length-1?'1px solid var(--border)':'none' }}>
                  <Row
                    left={<CatIcon color={color} emoji={emoji} />}
                    center={<div><div style={{ fontSize:14,fontWeight:600,marginBottom:2 }}>{title}</div><div style={{ fontSize:12,color:'var(--text-3)' }}>{sub}</div></div>}
                    right={rightEl}
                    onEdit={()=>{setEditing(inv);setSheet(true)}}
                    onDelete={()=>remove(inv.id)}
                  />
                </div>
              )
            })
          }
        </Card>
      </div>
      <FAB onClick={()=>{setEditing(null);setSheet(true)}} />
      <BottomSheet open={sheet} onClose={()=>{setSheet(false);setEditing(null)}} title={editing?'Изменить':`Добавить: ${addTitle[tab]}`}>
        {tab==='crypto' && <CryptoForm initial={editing?.type==='crypto'?editing as CryptoInvestment:undefined} onClose={()=>{setSheet(false);setEditing(null)}} />}
        {tab==='staking' && <StakingForm initial={editing?.type==='staking'?editing as StakingInvestment:undefined} onClose={()=>{setSheet(false);setEditing(null)}} />}
        {tab==='fixed' && <FixedForm initial={editing?.type==='fixed'?editing as FixedInvestment:undefined} onClose={()=>{setSheet(false);setEditing(null)}} />}
      </BottomSheet>
    </Page>
  )
}
