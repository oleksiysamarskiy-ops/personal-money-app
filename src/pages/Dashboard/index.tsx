import React from 'react'
import { useIncomeStore } from '@/features/income/store'
import { useExpenseStore } from '@/features/expenses/store'
import { useSavingsStore } from '@/features/savings/store'
import { getMonthlyIncome, getTotalIncome, getIncomeByMonth } from '@/features/income/selectors'
import { getMonthlyExpenses, getTotalExpenses, groupExpensesByCategory } from '@/features/expenses/selectors'
import { getMonthlySavings, getTotalSavings } from '@/features/savings/schema'
import { StatCard } from '@/components/ui'
import { categoryColors } from '@/features/expenses/schema'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar, ComposedChart, Line,
} from 'recharts'
import { format } from 'date-fns'

export default function DashboardPage() {
  const incomes = useIncomeStore((s) => s.incomes)
  const expenses = useExpenseStore((s) => s.expenses)
  const savings = useSavingsStore((s) => s.entries)

  const monthIncome = getMonthlyIncome(incomes)
  const monthExpenses = getMonthlyExpenses(expenses)
  const monthSavings = getMonthlySavings(savings)
  const monthFreeCash = monthIncome - monthExpenses - monthSavings

  const totalIncome = getTotalIncome(incomes)
  const totalExpenses = getTotalExpenses(expenses)
  const totalSavings = getTotalSavings(savings)
  const totalFreeCash = totalIncome - totalExpenses - totalSavings

  const byCat = groupExpensesByCategory(expenses)

  // Build combined monthly chart
  const allMonths = [...new Set([
    ...incomes.map((i) => i.date.slice(0, 7)),
    ...expenses.map((e) => e.date.slice(0, 7)),
  ])].sort()

  const monthlyData = allMonths.map((m) => {
    const label = format(new Date(m + '-01'), 'MMM yy')
    const inc = incomes.filter((i) => i.date.startsWith(m)).reduce((s, i) => s + i.amount, 0)
    const exp = expenses.filter((e) => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0)
    const sav = savings.filter((s) => s.date.startsWith(m)).reduce((sum, s) => sum + s.amount, 0)
    return { month: label, income: inc, expenses: exp, savings: sav, freeCash: inc - exp - sav }
  })

  const hasData = incomes.length > 0 || expenses.length > 0

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          {format(new Date(), 'MMMM yyyy')} overview
        </p>
      </div>

      {/* This month */}
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
        This Month
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard title="Income" value={`$${monthIncome.toFixed(2)}`} color="green" icon="↑" />
        <StatCard title="Expenses" value={`$${monthExpenses.toFixed(2)}`} color="red" icon="↓" />
        <StatCard title="Savings" value={`$${monthSavings.toFixed(2)}`} color="yellow" icon="⬡" />
        <StatCard title="Free Cash" value={`$${monthFreeCash.toFixed(2)}`} color={monthFreeCash >= 0 ? 'accent' : 'red'} icon="◈" />
      </div>

      {/* All time */}
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
        All Time
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 32 }}>
        <StatCard title="Total Income" value={`$${totalIncome.toFixed(2)}`} color="green" />
        <StatCard title="Total Expenses" value={`$${totalExpenses.toFixed(2)}`} color="red" />
        <StatCard title="Total Savings" value={`$${totalSavings.toFixed(2)}`} color="yellow" />
        <StatCard title="Net Free Cash" value={`$${totalFreeCash.toFixed(2)}`} color={totalFreeCash >= 0 ? 'accent' : 'red'} />
      </div>

      {!hasData && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '48px', textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: 8, color: 'var(--text)' }}>No data yet</div>
          <div style={{ fontSize: '13px' }}>Add income and expenses to see your financial overview here.</div>
        </div>
      )}

      {monthlyData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: byCat.length ? '1fr 340px' : '1fr', gap: 16 }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '20px 24px',
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 16 }}>
              INCOME vs EXPENSES
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#6b7494', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7494', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  contentStyle={{ background: '#171b27', border: '1px solid #2a3050', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="income" fill="#22c55e" opacity={0.8} radius={[3, 3, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" opacity={0.8} radius={[3, 3, 0, 0]} name="Expenses" />
                <Line dataKey="freeCash" stroke="#6c63ff" strokeWidth={2} dot={false} name="Free Cash" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {byCat.length > 0 && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '20px 24px',
            }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
                EXPENSES BY CATEGORY
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byCat} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {byCat.map((entry) => (
                      <Cell key={entry.name} fill={categoryColors[entry.name] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#171b27', border: '1px solid #2a3050', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`$${v.toFixed(2)}`, '']}
                  />
                  <Legend formatter={(v) => <span style={{ color: '#9aa0c0', fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
