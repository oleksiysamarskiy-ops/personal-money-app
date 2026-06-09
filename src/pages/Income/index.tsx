import React, { useState } from 'react'
import { useIncomeStore } from '@/features/income/store'
import { getMonthlyIncome, getTotalIncome } from '@/features/income/selectors'
import IncomeForm from '@/features/income/IncomeForm'
import { BottomSheet, StatCard, Page, SectionHead, Row, CatIcon, Amount, Empty, Btn } from '@/components/ui'
import { Income } from '@/types/income'
import { format } from 'date-fns'

export default function IncomePage() {
  const { incomes, removeIncome } = useIncomeStore()
  const [sheet, setSheet] = useState(false)
  const [editing, setEditing] = useState<Income | null>(null)
  const [search, setSearch] = useState('')

  const monthly = getMonthlyIncome(incomes)
  const total = getTotalIncome(incomes)

  const filtered = incomes
    .filter(i => !search || i.source.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Page>
      {/* Header */}
      <div style={{ padding: '56px 20px 20px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>Доходы</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <StatCard label="Этот месяц" value={`${monthly.toLocaleString('ru-RU')}`} sub="руб." color="green" icon="↑" />
          <StatCard label="Всего" value={`${total.toLocaleString('ru-RU')}`} sub="за всё время" color="accent" icon="◈" />
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '0 20px 16px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по источнику…"
          style={{
            width: '100%', background: 'var(--bg-input)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: '12px 14px', color: 'var(--text)', fontSize: 14, outline: 'none',
          }}
        />
      </div>

      {/* List */}
      <div style={{ padding: '0 20px' }}>
        <SectionHead title={`Записей: ${filtered.length}`} />
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {filtered.length === 0
            ? <Empty icon="💰" title="Нет доходов" sub="Нажмите + чтобы добавить" />
            : filtered.map((income, idx) => (
              <div key={income.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <Row
                  left={<CatIcon color="#3DD68C" emoji="💰" />}
                  center={
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{income.source}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        {format(new Date(income.date), 'dd MMM yyyy')}
                        {income.note && ` · ${income.note}`}
                      </div>
                    </div>
                  }
                  right={<Amount value={income.amount} currency={income.currency} sign="+" color="var(--green)" />}
                  onEdit={() => { setEditing(income); setSheet(true) }}
                  onDelete={() => removeIncome(income.id)}
                />
              </div>
            ))
          }
        </div>
      </div>

      {/* FAB */}
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

      <BottomSheet
        open={sheet}
        onClose={() => { setSheet(false); setEditing(null) }}
        title={editing ? 'Изменить доход' : 'Новый доход'}
      >
        <IncomeForm initial={editing || undefined} onClose={() => { setSheet(false); setEditing(null) }} />
      </BottomSheet>
    </Page>
  )
}
