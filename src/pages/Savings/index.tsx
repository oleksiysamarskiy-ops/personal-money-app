import React, { useState } from 'react'
import { useSavingsStore } from '@/features/savings/store'
import { getTotalSavings, getMonthlySavings, getSavingsByMonth } from '@/features/savings/schema'
import { useIncomeStore } from '@/features/income/store'
import { useExpenseStore } from '@/features/expenses/store'
import { getTotalIncome } from '@/features/income/selectors'
import { getTotalExpenses } from '@/features/expenses/selectors'
import SavingsForm from '@/features/savings/SavingsForm'
import SavingsTable from '@/features/savings/SavingsTable'
import { StatCard, Modal, Btn } from '@/components/ui'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function SavingsPage() {
  const entries = useSavingsStore((s) => s.entries)
  const incomes = useIncomeStore((s) => s.incomes)
  const expenses = useExpenseStore((s) => s.expenses)
  const [showForm, setShowForm] = useState(false)

  const total = getTotalSavings(entries)
  const monthly = getMonthlySavings(entries)
  const freeCash = getTotalIncome(incomes) - getTotalExpenses(expenses) - total
  const chartData = getSavingsByMonth(entries)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: 4 }}>Savings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{entries.length} entries total</p>
        </div>
        <Btn onClick={() => setShowForm(true)}>+ Add Savings</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard title="Total Saved" value={`$${total.toFixed(2)}`} color="yellow" icon="🏦" />
        <StatCard title="This Month" value={`$${monthly.toFixed(2)}`} color="accent" icon="📅" />
        <StatCard title="Free Cash" value={`$${freeCash.toFixed(2)}`} color={freeCash >= 0 ? 'green' : 'red'} icon="💸" sub="income − expenses − savings" />
      </div>

      {chartData.length > 1 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 24,
        }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 16 }}>SAVINGS BY MONTH</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6b7494', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7494', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{ background: '#171b27', border: '1px solid #2a3050', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: '#f59e0b' }}
              />
              <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <SavingsTable />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Savings">
        <SavingsForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}
