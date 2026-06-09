import React, { useState } from 'react'
import { useIncomeStore } from './store'
import { Income } from '@/types/income'
import { Btn, Badge, EmptyState, Modal } from '@/components/ui'
import IncomeForm from './IncomeForm'
import { format } from 'date-fns'

export default function IncomeTable({ filter }: { filter?: string }) {
  const { incomes, removeIncome } = useIncomeStore()
  const [editing, setEditing] = useState<Income | null>(null)
  const [search, setSearch] = useState('')
  const [monthFilter, setMonthFilter] = useState('')

  const months = [...new Set(incomes.map((i) => i.date.slice(0, 7)))].sort().reverse()

  const filtered = incomes
    .filter((i) => {
      const q = search.toLowerCase()
      const matchSearch = !q || i.source.toLowerCase().includes(q) || (i.note || '').toLowerCase().includes(q)
      const matchMonth = !monthFilter || i.date.startsWith(monthFilter)
      return matchSearch && matchMonth
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search source or note…"
          style={{
            flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '8px 14px', color: 'var(--text)',
            fontSize: '13px', outline: 'none',
          }}
        />
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          style={{
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '8px 14px', color: 'var(--text)',
            fontSize: '13px', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">All months</option>
          {months.map((m) => (
            <option key={m} value={m}>{format(new Date(m + '-01'), 'MMMM yyyy')}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="💰" message="No income entries yet. Add your first one above." />
      ) : (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Date', 'Source', 'Amount', 'Currency', 'Note', ''].map((h) => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '11px', color: 'var(--text-muted)',
                    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((income, idx) => (
                <tr
                  key={income.id}
                  style={{
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                    {format(new Date(income.date), 'dd MMM yyyy')}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500 }}>{income.source}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--green)' }}>
                    +{income.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge label={income.currency} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {income.note || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" variant="ghost" onClick={() => setEditing(income)}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => removeIncome(income.id)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Income">
        {editing && (
          <IncomeForm
            initial={editing}
            onClose={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
  )
}
