import React from 'react'
import { useIncomeStore } from '@/features/income/store'
import { useExpenseStore } from '@/features/expenses/store'
import { useSavingsStore } from '@/features/savings/store'
import { getMonthlyIncome, getTotalIncome, getIncomeByMonth } from '@/features/income/selectors'
import { getMonthlyExpenses, getTotalExpenses, groupExpensesByCategory } from '@/features/expenses/selectors'
import { getMonthlySavings, getTotalSavings } from '@/features/savings/schema'
import { getCategoryMeta } from '@/features/expenses/schema'
import { Page, SectionHead } from '@/components/ui'
import { format } from 'date-fns'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  ComposedChart, Bar, Line, CartesianGrid
} from 'recharts'
import { useNavigate } from 'react-router-dom'

function BigStat({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ flex: '1 1 0', minWidth: 0 }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)', color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const incomes = useIncomeStore(s => s.incomes)
  const expenses = useExpenseStore(s => s.expenses)
  const savings = useSavingsStore(s => s.entries)
  const navigate = useNavigate()

  const mIncome = getMonthlyIncome(incomes)
  const mExpenses = getMonthlyExpenses(expenses)
  const mSavings = getMonthlySavings(savings)
  const mFree = mIncome - mExpenses - mSavings

  const tIncome = getTotalIncome(incomes)
  const tExpenses = getTotalExpenses(expenses)
  const tSavings = getTotalSavings(savings)
  const tFree = tIncome - tExpenses - tSavings

  const byCat = groupExpensesByCategory(expenses).sort((a, b) => b.value - a.value).slice(0, 5)

  const allMonths = [...new Set([
    ...incomes.map(i => i.date.slice(0, 7)),
    ...expenses.map(e => e.date.slice(0, 7)),
  ])].sort()

  const chartData = allMonths.map(m => ({
    month: format(new Date(m + '-01'), 'MMM'),
    income: incomes.filter(i => i.date.startsWith(m)).reduce((s, i) => s + i.amount, 0),
    expenses: expenses.filter(e => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0),
  }))

  const hasData = incomes.length > 0 || expenses.length > 0

  return (
    <Page>
      {/* Hero */}
      <div style={{ padding: '56px 20px 24px' }}>
        <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4 }}>
          {format(new Date(), 'MMMM yyyy')}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 20 }}>Обзор</h1>

        {/* Free cash hero card */}
        <div style={{
          background: 'var(--bg-card)',
          border: `1px solid ${mFree >= 0 ? 'rgba(61,214,140,0.15)' : 'rgba(242,85,90,0.15)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: 12,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: mFree >= 0 ? 'var(--green)' : 'var(--red)',
            opacity: 0.7,
          }} />
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Свободные средства · месяц
          </div>
          <div style={{
            fontSize: 40, fontWeight: 800, fontFamily: 'var(--mono)',
            letterSpacing: '-0.04em', lineHeight: 1,
            color: mFree >= 0 ? 'var(--green)' : 'var(--red)',
            marginBottom: 16,
          }}>
            {mFree >= 0 ? '+' : ''}{mFree.toLocaleString('ru-RU')}
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <BigStat label="Доходы" value={mIncome.toLocaleString('ru-RU')} color="var(--green)" />
            <BigStat label="Расходы" value={mExpenses.toLocaleString('ru-RU')} color="var(--red)" />
            <BigStat label="Сбережения" value={mSavings.toLocaleString('ru-RU')} color="var(--yellow)" />
          </div>
        </div>

        {/* All-time row */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '16px 18px',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>За всё время</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <BigStat label="Накоплено" value={tSavings.toLocaleString('ru-RU')} sub="руб." color="var(--yellow)" />
            <BigStat label="Остаток" value={tFree.toLocaleString('ru-RU')} sub="руб." color={tFree >= 0 ? 'var(--green)' : 'var(--red)'} />
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 8px 8px 4px' }}>
            <div style={{ paddingLeft: 12, marginBottom: 12 }}>
              <SectionHead title="Доходы vs Расходы" />
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#606078', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#606078', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: '#13131A', border: '1px solid #ffffff11', borderRadius: 10, fontSize: 12 }}
                  formatter={(v: number) => [`${v.toLocaleString('ru-RU')} руб.`, '']}
                />
                <Bar dataKey="income" fill="var(--green)" opacity={0.7} radius={[3, 3, 0, 0]} name="Доходы" />
                <Bar dataKey="expenses" fill="var(--red)" opacity={0.7} radius={[3, 3, 0, 0]} name="Расходы" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top categories */}
      {byCat.length > 0 && (
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 16px 10px' }}>
              <SectionHead title="Топ расходов" />
            </div>
            {byCat.map((cat, idx) => {
              const meta = getCategoryMeta(cat.name)
              const pct = tExpenses > 0 ? (cat.value / tExpenses) * 100 : 0
              return (
                <div key={cat.name} style={{
                  padding: '10px 16px',
                  borderTop: idx === 0 ? '1px solid var(--border)' : 'none',
                  borderBottom: idx < byCat.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{meta.emoji}</span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{cat.name}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>
                      {cat.value.toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <div style={{ height: 3, background: 'var(--bg-input)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: 2, opacity: 0.8 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ padding: '0 20px 8px' }}>
        <SectionHead title="Быстрый переход" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Доходы', icon: '↑', color: 'var(--green)', to: '/income' },
            { label: 'Расходы', icon: '↓', color: 'var(--red)', to: '/expenses' },
            { label: 'Сбережения', icon: '⬡', color: 'var(--yellow)', to: '/savings' },
          ].map(item => (
            <button key={item.to} onClick={() => navigate(item.to)} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '16px',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', fontFamily: 'var(--font)',
              WebkitTapHighlightColor: 'transparent',
            }}>
              <span style={{ fontSize: 20, color: item.color }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Page>
  )
}
