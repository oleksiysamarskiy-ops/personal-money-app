import React, { useState } from 'react'
import { useExpenseStore } from '@/features/expenses/store'
import { getMonthlyExpenses, getTotalExpenses, groupExpensesByCategory, getTopCategory } from '@/features/expenses/selectors'
import ExpenseForm from '@/features/expenses/ExpenseForm'
import { getCategoryMeta } from '@/features/expenses/schema'
import { BottomSheet, StatCard, Page, SectionHead, Row, CatIcon, Amount, Empty } from '@/components/ui'
import { Expense } from '@/types/expense'
import { format } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function ExpensesPage() {
  const { expenses, removeExpense } = useExpenseStore()
  const [sheet, setSheet] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [catFilter, setCatFilter] = useState('')

  const monthly = getMonthlyExpenses(expenses)
  const total = getTotalExpenses(expenses)
  const byCat = groupExpensesByCategory(expenses)
  const top = getTopCategory(expenses)

  const filtered = expenses
    .filter(e => !catFilter || e.category === catFilter)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Page>
      <div style={{ padding: '56px 20px 20px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>Расходы</h1>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <StatCard label="Этот месяц" value={`${monthly.toLocaleString('ru-RU')}`} sub="руб." color="red" icon="↓" />
          <StatCard label="Всего" value={`${total.toLocaleString('ru-RU')}`} sub="за всё время" color="yellow" icon="🧾" />
        </div>
        {top && (
          <StatCard label="Топ категория" value={top.name} sub={`${top.value.toLocaleString('ru-RU')} руб.`} color="accent" full />
        )}
      </div>

      {/* Pie */}
      {byCat.length > 0 && (
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '16px 8px 8px' }}>
            <SectionHead title="По категориям" />
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {byCat.map(entry => {
                    const meta = getCategoryMeta(entry.name)
                    return <Cell key={entry.name} fill={meta.color} />
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#13131A', border: '1px solid #ffffff11', borderRadius: 10, fontSize: 12 }}
                  formatter={(v: number) => [`${v.toLocaleString('ru-RU')} руб.`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Category chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 8px 8px' }}>
              <button
                onClick={() => setCatFilter('')}
                style={{
                  padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)',
                  background: !catFilter ? 'var(--accent)' : 'var(--bg-input)',
                  color: !catFilter ? '#fff' : 'var(--text-2)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >Все</button>
              {byCat.map(c => {
                const meta = getCategoryMeta(c.name)
                return (
                  <button key={c.name} onClick={() => setCatFilter(c.name === catFilter ? '' : c.name)} style={{
                    padding: '5px 12px', borderRadius: 20,
                    border: `1px solid ${catFilter === c.name ? meta.color : 'var(--border)'}`,
                    background: catFilter === c.name ? `${meta.color}22` : 'var(--bg-input)',
                    color: catFilter === c.name ? meta.color : 'var(--text-2)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>{meta.emoji} {c.name}</button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ padding: '0 20px' }}>
        <SectionHead title={`Записей: ${filtered.length}`} />
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {filtered.length === 0
            ? <Empty icon="🧾" title="Нет расходов" sub="Нажмите + чтобы добавить" />
            : filtered.map((expense, idx) => {
              const meta = getCategoryMeta(expense.category)
              return (
                <div key={expense.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <Row
                    left={<CatIcon color={meta.color} emoji={meta.emoji} />}
                    center={
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{expense.category}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                          {format(new Date(expense.date), 'dd MMM yyyy')}
                          {expense.note && ` · ${expense.note}`}
                        </div>
                      </div>
                    }
                    right={<Amount value={expense.amount} currency={expense.currency} sign="-" color="var(--red)" />}
                    onEdit={() => { setEditing(expense); setSheet(true) }}
                    onDelete={() => removeExpense(expense.id)}
                  />
                </div>
              )
            })
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

      <BottomSheet open={sheet} onClose={() => { setSheet(false); setEditing(null) }} title={editing ? 'Изменить расход' : 'Новый расход'}>
        <ExpenseForm initial={editing || undefined} onClose={() => { setSheet(false); setEditing(null) }} />
      </BottomSheet>
    </Page>
  )
}
