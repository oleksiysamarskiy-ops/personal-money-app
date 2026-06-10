import React, { useState, useEffect } from 'react'
import { buildMonthlyChart, expensesByCategory, financialCushion, avgMonthlyExpenses } from '@/utils/selectors'
import { totalInvestments } from '@/utils/selectors'
import { fmt } from '@/utils/currency'
import { monthKey, monthLabel } from '@/utils/date'
import { Page, Card, SectionHead, SegmentControl } from '@/components/ui'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { useIncomeStore } from '@/features/income/store'
import { useExpenseStore } from '@/features/expenses/store'
import { useSavingsStore } from '@/features/savings/store'
import { useInvestmentStore } from '@/features/investments/store'
import { useDebtStore } from '@/features/debts/store'
import { useSettingsStore } from '@/store/settings'
import { useUserId } from '@/store/userContext'

const TT = { contentStyle:{ background:'#13131A',border:'1px solid #ffffff0f',borderRadius:10,fontSize:11 } }
const CATS_COLORS: Record<string,string> = { 'Еда':'#F5A623','Транспорт':'#4A9EFF','Жильё':'#3DD68C','Здоровье':'#F2555A','Развлечения':'#A855F7','Покупки':'#EC4899','Образование':'#5B5BD6','Путешествия':'#06B6D4','Подписки':'#F97316','Прочее':'#6B7280' }

export default function AnalyticsPage() {
  const uid = useUserId()
  const { incomes, load: loadInc, loaded: incLoaded } = useIncomeStore()
  const { expenses, load: loadExp, loaded: expLoaded } = useExpenseStore()
  const { entries: savings, load: loadSav, loaded: savLoaded } = useSavingsStore()
  const { investments, load: loadInv, loaded: invLoaded } = useInvestmentStore()
  const { debts, load: loadDebt, loaded: debtLoaded } = useDebtStore()
  const { settings, load: loadSettings, loaded: settLoaded } = useSettingsStore()
  const base = settings.baseCurrency
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (!incLoaded) loadInc(uid)
    if (!expLoaded) loadExp(uid)
    if (!savLoaded) loadSav(uid)
    if (!invLoaded) loadInv(uid)
    if (!debtLoaded) loadDebt(uid)
    if (!settLoaded) loadSettings(uid)
  }, [uid])

  const monthly = buildMonthlyChart(incomes, expenses, base)
  const byCat = expensesByCategory(expenses, base)
  const cushion = financialCushion(savings, expenses, base)
  const avgExp = avgMonthlyExpenses(expenses, base)

  // Savings by month
  const savMonths = [...new Set(savings.map(s=>monthKey(s.date)))].sort()
  const savChart = savMonths.map(k=>({ month:monthLabel(k), amount:savings.filter(s=>monthKey(s.date)===k).reduce((sum,s)=>sum+s.amount,0) }))

  // Cumulative savings
  let cumSav = 0
  const cumSavChart = savChart.map(s=>{ cumSav+=s.amount; return { month:s.month, total:cumSav } })

  // Debt reduction
  const debtMonths = [...new Set(debts.flatMap(d=>d.payments.map(p=>monthKey(p.date))))].sort()
  const debtChart = debtMonths.map(k=>({ month:monthLabel(k), paid:debts.flatMap(d=>d.payments).filter(p=>monthKey(p.date)===k).reduce((s,p)=>s+p.amount,0) }))

  return (
    <Page title="Аналитика">
      <div style={{ padding:'8px 20px 16px' }}>
        <SegmentControl
          options={[{label:'Обзор',value:'overview'},{label:'Расходы',value:'expenses'},{label:'Динамика',value:'growth'}]}
          value={tab} onChange={setTab}
        />
      </div>

      {tab==='overview' && (
        <div style={{ padding:'0 20px',display:'flex',flexDirection:'column',gap:14 }}>
          {/* Key metrics */}
          <Card style={{ padding:'16px 18px' }}>
            <SectionHead title="Ключевые метрики" />
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {[
                { label:'Ср. расход в месяц', value:fmt(avgExp,base), color:'var(--red)' },
                { label:'Фин. подушка', value:cushion>0?`${cushion.toFixed(1)} мес.`:'—', color:cushion>=6?'var(--green)':cushion>=3?'var(--yellow)':'var(--red)' },
              ].map(m=>(
                <div key={m.label} style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <span style={{ fontSize:13,color:'var(--text-2)' }}>{m.label}</span>
                  <span style={{ fontSize:15,fontWeight:700,fontFamily:'var(--mono)',color:m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Income vs Expenses */}
          {monthly.length>0 && (
            <Card style={{ padding:'16px 16px 8px' }}>
              <SectionHead title="Доходы vs Расходы" />
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={monthly} margin={{ top:4,right:4,left:0,bottom:0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill:'#606078',fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#606078',fontSize:10 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip {...TT} formatter={(v:number)=>[fmt(v,base),'']} />
                  <Bar dataKey="income" fill="var(--green)" opacity={0.8} radius={[3,3,0,0]} name="Доходы" />
                  <Bar dataKey="expenses" fill="var(--red)" opacity={0.8} radius={[3,3,0,0]} name="Расходы" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Savings growth */}
          {cumSavChart.length>0 && (
            <Card style={{ padding:'16px 16px 8px' }}>
              <SectionHead title="Рост сбережений" />
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={cumSavChart} margin={{ top:4,right:4,left:0,bottom:0 }}>
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F5A623" stopOpacity={0.25}/><stop offset="95%" stopColor="#F5A623" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill:'#606078',fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#606078',fontSize:10 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip {...TT} formatter={(v:number)=>[fmt(v,base),'']} />
                  <Area dataKey="total" stroke="var(--yellow)" strokeWidth={2} fill="url(#sg)" dot={false} name="Накоплено" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {tab==='expenses' && (
        <div style={{ padding:'0 20px',display:'flex',flexDirection:'column',gap:14 }}>
          {byCat.length>0 && (
            <Card style={{ padding:'16px 16px 8px' }}>
              <SectionHead title="По категориям (всего)" />
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={byCat} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {byCat.map(e=><Cell key={e.name} fill={CATS_COLORS[e.name]||'#6B7280'} />)}
                  </Pie>
                  <Tooltip {...TT} formatter={(v:number)=>[fmt(v,base),'']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex',flexDirection:'column',gap:6,padding:'0 0 8px' }}>
                {byCat.slice(0,6).map(c=>{
                  const total = byCat.reduce((s,x)=>s+x.value,0)
                  const pct = total>0?(c.value/total*100):0
                  return (
                    <div key={c.name} style={{ display:'flex',alignItems:'center',gap:10 }}>
                      <div style={{ width:8,height:8,borderRadius:'50%',background:CATS_COLORS[c.name]||'#6B7280',flexShrink:0 }} />
                      <span style={{ fontSize:12,color:'var(--text-2)',flex:1 }}>{c.name}</span>
                      <span style={{ fontSize:12,fontFamily:'var(--mono)',color:'var(--text-num)' }}>{fmt(c.value,base)}</span>
                      <span style={{ fontSize:11,color:'var(--text-3)',width:36,textAlign:'right' }}>{pct.toFixed(0)}%</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {monthly.length>0 && (
            <Card style={{ padding:'16px 16px 8px' }}>
              <SectionHead title="Динамика расходов" />
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={monthly} margin={{ top:4,right:4,left:0,bottom:0 }}>
                  <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F2555A" stopOpacity={0.25}/><stop offset="95%" stopColor="#F2555A" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill:'#606078',fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#606078',fontSize:10 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip {...TT} formatter={(v:number)=>[fmt(v,base),'']} />
                  <Area dataKey="expenses" stroke="var(--red)" strokeWidth={2} fill="url(#eg)" dot={false} name="Расходы" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {tab==='growth' && (
        <div style={{ padding:'0 20px',display:'flex',flexDirection:'column',gap:14 }}>
          {monthly.length>0 && (
            <Card style={{ padding:'16px 16px 8px' }}>
              <SectionHead title="Рост доходов" />
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={monthly} margin={{ top:4,right:4,left:0,bottom:0 }}>
                  <defs><linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3DD68C" stopOpacity={0.25}/><stop offset="95%" stopColor="#3DD68C" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill:'#606078',fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#606078',fontSize:10 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip {...TT} formatter={(v:number)=>[fmt(v,base),'']} />
                  <Area dataKey="income" stroke="var(--green)" strokeWidth={2} fill="url(#ig)" dot={false} name="Доходы" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}

          {debtChart.length>0 && (
            <Card style={{ padding:'16px 16px 8px' }}>
              <SectionHead title="Погашение долгов" />
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={debtChart} margin={{ top:4,right:4,left:0,bottom:0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill:'#606078',fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#606078',fontSize:10 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip {...TT} formatter={(v:number)=>[fmt(v,base),'']} />
                  <Bar dataKey="paid" fill="var(--accent)" radius={[3,3,0,0]} name="Погашено" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}
    </Page>
  )
}
