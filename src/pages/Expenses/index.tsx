import React, { useState } from 'react'
import { useExpenseStore } from '@/features/expenses/store'
import { getMonthlyExpenses, getTotalExpenses, groupExpensesByCategory, getTopCategory } from '@/features/expenses/selectors'
import ExpenseForm from '@/features/expenses/ExpenseForm'
import ExpenseTable from '@/features/expenses/ExpenseTable'
import ExpenseCategoryChart from '@/features/expenses/ExpenseCategoryChart'
import { StatCard, Modal, Btn } from '@/components/ui'

export default function ExpensesPage() {
  const expenses = useExpenseStore((s) => s.expenses)
  const [showForm, setShowForm] = useState(false)

  const monthly = getMonthlyExpenses(expenses)
  const total = getTotalExpenses(expenses)
  const byCategory = groupExpensesByCategory(expenses)
  const top = getTopCategory(expenses)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: 4 }}>Expenses</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{expenses.length} entries total</p>
        </div>
        <Btn onClick={() => setShowForm(true)}>+ Add Expense</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard title="This Month" value={`$${monthly.toFixed(2)}`} color="red" icon="📉" />
        <StatCard title="Total Expenses" value={`$${total.toFixed(2)}`} color="yellow" icon="🧾" />
        <StatCard title="Top Category" value={top?.name || '—'} sub={top ? `$${top.value.toFixed(2)}` : undefined} color="accent" icon="🏷️" />
      </div>

      {byCategory.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 24,
        }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>BY CATEGORY</div>
          <ExpenseCategoryChart data={byCategory} />
        </div>
      )}

      <ExpenseTable />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Expense">
        <ExpenseForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}
