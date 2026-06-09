import React from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

interface Props {
  data: { month: string; amount: number }[]
}

export default function IncomeGrowthChart({ data }: Props) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#6b7494', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7494', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
        <Tooltip
          contentStyle={{ background: '#171b27', border: '1px solid #2a3050', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#9aa0c0' }}
          itemStyle={{ color: '#22c55e' }}
        />
        <Area dataKey="amount" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
