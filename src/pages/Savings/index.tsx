import React, { useState } from 'react'
import { useSavingsStore } from '@/features/savings/store'
import { getTotalSavings, getMonthlySavings } from '@/features/savings/schema'
import { useIncomeStore } from '@/features/income/store'
import { useExpenseStore } from '@/features/expenses/store'
import { getTotalIncome } from '@/features/income/selectors'
import { getTotalExpenses } from '@/features/expenses/selectors'
import SavingsForm from '@/features/savings/SavingsForm'
import { BottomSheet, StatCard, Page, SectionHead, Row, CatIcon, Amount, Empty } from '@/components/ui'
import { SavingsEntry } from '@/types/savings'
import { format } from 'date-fns'

export default function SavingsPage() {
  const { entries, removeEntry } = useSavingsStore()
  const incomes = useIncomeStore(s => s.incomes)
  const expenses = useExpenseStore(s => s.expenses)
  const [sheet, setSheet] = useState(false)
  const [editing, setEditing] = useState<SavingsEntry | null>(null)

  const total = getTotalSavings(entries)
  const monthly = getMonthlySavings(entries)
  const freeCash = getTotalIncome(incomes) - getTotalExpenses(expenses) - total

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Page>
      <div style={{ padding: '56px 20px 20px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>Сбережения</h1>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <StatCard label="Накоплено" value={`${total.toLocaleString('ru-RU')}`} sub="всего" color="yellow" icon="🏦" />
          <StatCard label="Этот месяц" value={`${monthly.toLocaleString('ru-RU')}`} sub="руб." color="accent" icon="📅" />
        </div>
        <div style={{
          background: 'var(--bg-card)', border: `1px solid ${freeCash >= 0 ? 'rgba(61,214,140,0.2)' : 'rgba(242,85,90,0.2)'}`,
          borderRadius: 'var(--radius)', padding: '16px 18px',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Свободные средства
          </div>
          <div style={{
            fontSize: 32, fontWeight: 700, fontFamily: 'var(--mono)',
            letterSpacing: '-0.03em',
            color: freeCash >= 0 ? 'var(--green)' : 'var(--red)',
          }}>
            {freeCash >= 0 ? '+' : ''}{freeCash.toLocaleString('ru-RU')}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>доходы − расходы − сбережения</div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <SectionHead title={`Записей: ${sorted.length}`} />
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {sorted.length === 0
            ? <Empty icon="🏦" title="Нет сбережений" sub="Нажмите + чтобы добавить" />
            : sorted.map((entry, idx) => (
              <div key={entry.id} style={{ borderBottom: idx < sorted.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <Row
                  left={<CatIcon color="#F5A623" emoji="🏦" />}
                  center={
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{entry.note || 'Сбережения'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{format(new Date(entry.date), 'dd MMM yyyy')}</div>
                    </div>
                  }
                  right={<Amount value={entry.amount} currency={entry.currency} color="var(--yellow)" />}
                  onEdit={() => { setEditing(entry); setSheet(true) }}
                  onDelete={() => removeEntry(entry.id)}
                />
              </div>
            ))
          }
        </div>
      </div>

      <button
        onClick={() => { setEditing(null); setSheet(true) }}
        style={{
          position: 'fixed', bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 16px)', right: 20,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--accent)', color: '#fff', fontSize: 24,
          border: 'none', cursor: 'pointer', zIndex: 50,
          boxShadow: '0 4px 20px rgba(91,91,214,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >+</button>

      <BottomSheet open={sheet} onClose={() => { setSheet(false); setEditing(null) }} title={editing ? 'Изменить' : 'Новые сбережения'}>
        <SavingsForm initial={editing || undefined} onClose={() => { setSheet(false); setEditing(null) }} />
      </BottomSheet>
    </Page>
  )
}
