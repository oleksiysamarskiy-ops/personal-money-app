import React, { useState } from 'react'
import { useSavingsStore } from './store'
import { SavingsEntry } from '@/types/savings'
import { Btn, Badge, EmptyState, Modal } from '@/components/ui'
import SavingsForm from './SavingsForm'
import { format } from 'date-fns'

export default function SavingsTable() {
  const { entries, removeEntry } = useSavingsStore()
  const [editing, setEditing] = useState<SavingsEntry | null>(null)

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))

  if (!sorted.length) {
    return <EmptyState icon="🏦" message="No savings entries yet. Start saving today!" />
  }

  return (
    <>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Date', 'Amount', 'Currency', 'Note', ''].map((h) => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: '11px', color: 'var(--text-muted)',
                  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, idx) => (
              <tr
                key={entry.id}
                style={{ borderBottom: idx < sorted.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                  {format(new Date(entry.date), 'dd MMM yyyy')}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--yellow)' }}>
                  {entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '12px 16px' }}><Badge label={entry.currency} /></td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.note || '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn size="sm" variant="ghost" onClick={() => setEditing(entry)}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => removeEntry(entry.id)}>Delete</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Savings">
        {editing && <SavingsForm initial={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </>
  )
}
