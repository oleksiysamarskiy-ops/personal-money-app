import React, { useState } from 'react'
import { useExpenseStore } from './store'
import { Expense } from '@/types/expense'
import { Btn, Badge, EmptyState, Modal } from '@/components/ui'
import { categoryColors } from './schema'
import ExpenseForm from './ExpenseForm'
import { format } from 'date-fns'

export default function ExpenseTable() {
  const { expenses, removeExpense } = useExpenseStore()
  const [editing, setEditing] = useState<Expense | null>(null)
  const [search, setSearch] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const months = [...new Set(expenses.map((e) => e.date.slice(0, 7)))].sort().reverse()
  const categories = [...new Set(expenses.map((e) => e.category))].sort()

  const filtered = expenses
    .filter((e) => {
      const q = search.toLowerCase()
      const matchSearch = !q || e.category.toLowerCase().includes(q) || (e.note || '').toLowerCase().includes(q)
      const matchMonth = !monthFilter || e.date.startsWith(monthFilter)
      const matchCat = !categoryFilter || e.category === categoryFilter
      return matchSearch && matchMonth && matchCat
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          style={{
            flex: 1, minWidth: 160,
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '8px 14px', color: 'var(--text)',
            fontSize: '13px', outline: 'none',
          }}
        />
        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={{
          background: 'var(--bg-input)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '8px 14px', color: 'var(--text)',
          fontSize: '13px', outline: 'none', cursor: 'pointer',
        }}>
          <option value="">All months</option>
          {months.map((m) => (
            <option key={m} value={m}>{format(new Date(m + '-01'), 'MMMM yyyy')}</option>
          ))}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{
          background: 'var(--bg-input)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '8px 14px', color: 'var(--text)',
          fontSize: '13px', outline: 'none', cursor: 'pointer',
        }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🧾" message="No expense entries yet. Add your first one above." />
      ) : (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Date', 'Category', 'Amount', 'Currency', 'Note', ''].map((h) => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '11px', color: 'var(--text-muted)',
                    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((expense, idx) => (
                <tr
                  key={expense.id}
                  style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                    {format(new Date(expense.date), 'dd MMM yyyy')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge label={expense.category} color={categoryColors[expense.category]} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--red)' }}>
                    -{expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 16px' }}><Badge label={expense.currency} /></td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {expense.note || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" variant="ghost" onClick={() => setEditing(expense)}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => removeExpense(expense.id)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Expense">
        {editing && <ExpenseForm initial={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </>
  )
}
