import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { categoryColors } from './schema'

interface Props {
  data: { name: string; value: number }[]
}

export default function ExpenseCategoryChart({ data }: Props) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={categoryColors[entry.name] || '#6b7280'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#171b27', border: '1px solid #2a3050', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#9aa0c0' }}
          formatter={(v: number) => [`$${v.toFixed(2)}`, '']}
        />
        <Legend
          formatter={(value) => <span style={{ color: '#9aa0c0', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
