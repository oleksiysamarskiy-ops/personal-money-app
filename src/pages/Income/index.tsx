import React, { useState } from 'react'
import { useIncomeStore } from '@/features/income/store'
import { getMonthlyIncome, getTotalIncome, getIncomeByMonth } from '@/features/income/selectors'
import IncomeForm from '@/features/income/IncomeForm'
import IncomeTable from '@/features/income/IncomeTable'
import IncomeGrowthChart from '@/features/income/IncomeGrowthChart'
import { StatCard, Modal, Btn } from '@/components/ui'

export default function IncomePage() {
  const incomes = useIncomeStore((s) => s.incomes)
  const [showForm, setShowForm] = useState(false)

  const monthly = getMonthlyIncome(incomes)
  const total = getTotalIncome(incomes)
  const chartData = getIncomeByMonth(incomes)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: 4 }}>Income</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{incomes.length} entries total</p>
        </div>
        <Btn onClick={() => setShowForm(true)}>+ Add Income</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard title="This Month" value={`$${monthly.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="green" icon="📈" />
        <StatCard title="Total Income" value={`$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="accent" icon="💰" />
        <StatCard title="Entries" value={String(incomes.length)} color="blue" icon="📋" sub="all time" />
      </div>

      {chartData.length > 1 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 24,
        }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 16 }}>INCOME TREND</div>
          <IncomeGrowthChart data={chartData} />
        </div>
      )}

      <IncomeTable />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Income">
        <IncomeForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}
