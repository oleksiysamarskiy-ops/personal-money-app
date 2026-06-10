import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIncomeStore } from '@/features/income/store'
import { useExpenseStore } from '@/features/expenses/store'
import { useSavingsStore } from '@/features/savings/store'
import { useInvestmentStore } from '@/features/investments/store'
import { useDebtStore } from '@/features/debts/store'
import { useSubscriptionStore } from '@/features/subscriptions/store'
import { useSettingsStore } from '@/store/settings'
import { Currency, CryptoInvestment } from '@/types'
import {
  totalIncome, monthlyIncome, totalExpenses, monthlyExpenses,
  totalSavings, monthlySavings, totalInvestments,
  totalIOwe, totalOwedToMe, calcFreeCash, calcNetWorth, financialCushion
} from '@/utils/selectors'
import { fmt, CURRENCY_SYMBOLS } from '@/utils/currency'
import { daysUntil } from '@/utils/date'
import { Page, Card, SectionHead } from '@/components/ui'
import { format } from 'date-fns'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { buildMonthlyChart } from '@/utils/selectors'

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

const CURRENCIES: Currency[] = ['USD','EUR','PLN','UAH','GBP']

function MetricRow({ label, value, color, onClick }: { label:string; value:string; color?:string; onClick?:()=>void }) {
  return (
    <div onClick={onClick} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',borderBottom:'1px solid var(--border)',cursor:onClick?'pointer':'default' }}>
      <span style={{ fontSize:13,color:'var(--text-2)' }}>{label}</span>
      <span style={{ fontSize:15,fontWeight:700,fontFamily:'var(--mono)',color:color||'var(--text-num)',letterSpacing:'-0.02em' }}>{value}</span>
    </div>
  )
}

export default function DashboardPage() {
  const { incomes } = useIncomeStore()
  const { expenses } = useExpenseStore()
  const { entries: savings } = useSavingsStore()
  const { investments } = useInvestmentStore()
  const { debts } = useDebtStore()
  const { subscriptions } = useSubscriptionStore()
  const { settings, setBaseCurrency } = useSettingsStore()
  const base = settings.baseCurrency
  const navigate = useNavigate()
  const [prices, setPrices] = useState<Record<string,number>>({})
  const [showCurrPicker, setShowCurrPicker] = useState(false)

  useEffect(() => {
    const cryptos = investments.filter(i=>i.type==='crypto') as CryptoInvestment[]
    if (cryptos.length) fetchPrices(cryptos.map(c=>c.symbol)).then(setPrices)
  }, [investments])

  const mIncome    = monthlyIncome(incomes, base)
  const mExpenses  = monthlyExpenses(expenses, base)
  const mSavings   = monthlySavings(savings, base)
  const freeCash   = calcFreeCash(incomes, expenses, savings, debts, base)
  const totalSav   = totalSavings(savings, base)
  const totalInv   = totalInvestments(investments, prices, base)
  const iOwe       = totalIOwe(debts, base)
  const owedToMe   = totalOwedToMe(debts, base)
  const netWorth   = calcNetWorth(savings, investments, prices, freeCash, debts, base)
  const cushion    = financialCushion(savings, expenses, base)
  const monthChart = buildMonthlyChart(incomes, expenses, base)

  const upcoming = subscriptions
    .map(s=>({ ...s, days:daysUntil(s.nextBillingDate) }))
    .filter(s=>s.days>=0 && s.days<=14)
    .sort((a,b)=>a.days-b.days)
    .slice(0,3)

  return (
    <Page>
      {/* Header */}
      <div style={{ padding:'52px 20px 8px',display:'flex',alignItems:'flex-end',justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:12,color:'var(--text-3)',fontWeight:500,marginBottom:4 }}>
            {format(new Date(),'MMMM yyyy')}
          </div>
          <h1 style={{ fontSize:28,fontWeight:800,letterSpacing:'-0.03em' }}>Обзор</h1>
        </div>
        <button
          onClick={()=>setShowCurrPicker(v=>!v)}
          style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,padding:'8px 14px',color:'var(--text-2)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'var(--font)' }}
        >
          {CURRENCY_SYMBOLS[base]} {base}
        </button>
      </div>

      {/* Currency picker */}
      {showCurrPicker && (
        <div style={{ padding:'0 20px 12px' }}>
          <Card>
            <div style={{ display:'flex' }}>
              {CURRENCIES.map((c,i)=>(
                <button key={c} onClick={()=>{setBaseCurrency(c);setShowCurrPicker(false)}} style={{ flex:1,padding:'12px 4px',border:'none',borderRight:i<CURRENCIES.length-1?'1px solid var(--border)':'none',background:base===c?'var(--accent-dim)':'transparent',color:base===c?'var(--accent-2)':'var(--text-2)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'var(--font)' }}>
                  {c}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Net Worth Hero */}
      <div style={{ padding:'8px 20px 12px' }}>
        <Card style={{ padding:'20px',position:'relative',overflow:'hidden', border:`1px solid ${netWorth>=0?'rgba(91,91,214,0.3)':'rgba(242,85,90,0.25)'}` }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:netWorth>=0?'var(--accent)':'var(--red)' }} />
          <div style={{ fontSize:11,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.09em',marginBottom:6 }}>
            Чистый капитал
          </div>
          <div style={{ fontSize:40,fontWeight:800,fontFamily:'var(--mono)',letterSpacing:'-0.04em',lineHeight:1,color:netWorth>=0?'var(--accent-2)':'var(--red)',marginBottom:16 }}>
            {netWorth>=0?'+':''}{fmt(netWorth,base)}
          </div>
          <div style={{ display:'flex',gap:20 }}>
            {[
              { l:'Сбережения', v:fmt(totalSav,base), c:'var(--yellow)' },
              { l:'Инвестиции', v:fmt(totalInv,base), c:'var(--purple)' },
              { l:'Долги', v:fmt(iOwe,base), c:'var(--red)' },
            ].map(m=>(
              <div key={m.l}>
                <div style={{ fontSize:10,color:'var(--text-3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4 }}>{m.l}</div>
                <div style={{ fontSize:15,fontWeight:700,fontFamily:'var(--mono)',color:m.c,letterSpacing:'-0.02em' }}>{m.v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Free Cash */}
      <div style={{ padding:'0 20px 12px' }}>
        <Card style={{ padding:'18px',border:`1px solid ${freeCash>=0?'rgba(61,214,140,0.2)':'rgba(242,85,90,0.2)'}` }}>
          <div style={{ fontSize:11,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.09em',marginBottom:6 }}>Свободные средства</div>
          <div style={{ fontSize:32,fontWeight:800,fontFamily:'var(--mono)',letterSpacing:'-0.04em',color:freeCash>=0?'var(--green)':'var(--red)',marginBottom:10 }}>
            {freeCash>=0?'+':''}{fmt(freeCash,base)}
          </div>
          <div style={{ display:'flex',gap:6 }}>
            {[
              { l:'Доходы', v:fmt(mIncome,base), c:'var(--green)' },
              { l:'Расходы', v:fmt(mExpenses,base), c:'var(--red)' },
              { l:'Сбережения', v:fmt(mSavings,base), c:'var(--yellow)' },
            ].map(m=>(
              <div key={m.l} style={{ flex:1,background:'var(--bg-input)',borderRadius:10,padding:'10px 10px' }}>
                <div style={{ fontSize:9,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4 }}>{m.l}</div>
                <div style={{ fontSize:13,fontWeight:700,fontFamily:'var(--mono)',color:m.c,letterSpacing:'-0.02em' }}>{m.v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:11,color:'var(--text-3)',marginTop:8 }}>доходы − расходы − сбережения − выплаты</div>
        </Card>
      </div>

      {/* Metrics list */}
      <div style={{ padding:'0 20px 12px' }}>
        <Card style={{ padding:'4px 18px' }}>
          <MetricRow label="Доходы (месяц)" value={fmt(mIncome,base)} color="var(--green)" onClick={()=>navigate('/income')} />
          <MetricRow label="Расходы (месяц)" value={fmt(mExpenses,base)} color="var(--red)" onClick={()=>navigate('/expenses')} />
          <MetricRow label="Инвестиции" value={fmt(totalInv,base)} color="var(--purple)" onClick={()=>navigate('/investments')} />
          <MetricRow label="Я должен" value={fmt(iOwe,base)} color="var(--red)" onClick={()=>navigate('/debts')} />
          <MetricRow label="Мне должны" value={fmt(owedToMe,base)} color="var(--green)" onClick={()=>navigate('/debts')} />
          <div style={{ padding:'11px 0',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <span style={{ fontSize:13,color:'var(--text-2)' }}>Фин. подушка</span>
            <span style={{ fontSize:15,fontWeight:700,fontFamily:'var(--mono)',color:cushion>=6?'var(--green)':cushion>=3?'var(--yellow)':'var(--red)',letterSpacing:'-0.02em' }}>
              {cushion>0?`${cushion.toFixed(1)} мес.`:'—'}
            </span>
          </div>
        </Card>
      </div>

      {/* Chart */}
      {monthChart.length>0 && (
        <div style={{ padding:'0 20px 12px' }}>
          <Card style={{ padding:'16px 12px 8px' }}>
            <div style={{ paddingLeft:4,marginBottom:10 }}><SectionHead title="Доходы vs расходы" /></div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={monthChart} margin={{ top:4,right:4,left:0,bottom:0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill:'#606078',fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#606078',fontSize:10 }} axisLine={false} tickLine={false} width={38} />
                <Tooltip contentStyle={{ background:'#13131A',border:'1px solid #ffffff0f',borderRadius:10,fontSize:11 }} formatter={(v:number)=>[fmt(v,base),'']} />
                <Bar dataKey="income" fill="var(--green)" opacity={0.8} radius={[3,3,0,0]} name="Доходы" />
                <Bar dataKey="expenses" fill="var(--red)" opacity={0.8} radius={[3,3,0,0]} name="Расходы" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Upcoming subscriptions */}
      {upcoming.length>0 && (
        <div style={{ padding:'0 20px 12px' }}>
          <SectionHead title="Ближайшие подписки" />
          <Card>
            {upcoming.map((s,idx)=>(
              <div key={s.id} style={{ padding:'12px 16px',borderBottom:idx<upcoming.length-1?'1px solid var(--border)':'none',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:14,fontWeight:600 }}>{s.name}</div>
                  <div style={{ fontSize:12,color:'var(--text-3)',marginTop:2 }}>{fmt(s.price,s.currency)}</div>
                </div>
                <div style={{ fontSize:13,fontWeight:700,color:s.days<=3?'var(--red)':s.days<=7?'var(--yellow)':'var(--text-2)' }}>
                  {s.days===0?'Сегодня':`${s.days} дн.`}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </Page>
  )
}
