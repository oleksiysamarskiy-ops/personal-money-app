import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '@/components/ui'
import { useInvestmentStore } from '@/features/investments/store'
import { useDebtStore } from '@/features/debts/store'
import { useSubscriptionStore } from '@/features/subscriptions/store'
import { useSettingsStore } from '@/store/settings'
import { totalInvestments, totalIOwe, totalOwedToMe } from '@/utils/selectors'
import { fmt } from '@/utils/currency'
import { daysUntil } from '@/utils/date'

const sections = [
  { label:'Инвестиции', to:'/investments', icon:'📈', desc:'Крипто, стейкинг, вклады' },
  { label:'Долги', to:'/debts', icon:'🤝', desc:'Я должен / мне должны' },
  { label:'Подписки', to:'/subscriptions', icon:'📱', desc:'Регулярные платежи' },
  { label:'Аналитика', to:'/analytics', icon:'📊', desc:'Графики и тренды' },
]

export default function MorePage() {
  const navigate = useNavigate()
  const { investments } = useInvestmentStore()
  const { debts } = useDebtStore()
  const { subscriptions } = useSubscriptionStore()
  const { settings } = useSettingsStore()
  const base = settings.baseCurrency

  const upcoming = subscriptions
    .map(s => ({ ...s, days: s.nextBillingDate ? daysUntil(s.nextBillingDate) : 999 }))
    .filter(s => s.days >= 0)
    .sort((a,b) => a.days - b.days)
    .slice(0,3)

  return (
    <Page title="Ещё">
      <div style={{ padding:'0 20px',display:'flex',flexDirection:'column',gap:10 }}>
        {sections.map(s => (
          <button key={s.to} onClick={()=>navigate(s.to)} style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px 18px',display:'flex',alignItems:'center',gap:14,cursor:'pointer',fontFamily:'var(--font)',WebkitTapHighlightColor:'transparent',width:'100%' }}>
            <span style={{ fontSize:26,width:40,textAlign:'center' }}>{s.icon}</span>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:15,fontWeight:600,color:'var(--text)' }}>{s.label}</div>
              <div style={{ fontSize:12,color:'var(--text-3)',marginTop:2 }}>{s.desc}</div>
            </div>
            <span style={{ marginLeft:'auto',color:'var(--text-3)',fontSize:18 }}>›</span>
          </button>
        ))}

        {upcoming.length > 0 && (
          <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',overflow:'hidden',marginTop:8 }}>
            <div style={{ padding:'14px 16px 10px',fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.08em' }}>Ближайшие подписки</div>
            {upcoming.map((s,idx) => (
              <div key={s.id} style={{ padding:'12px 16px',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:14,fontWeight:600 }}>{s.name}</div>
                  <div style={{ fontSize:12,color:'var(--text-3)',marginTop:2 }}>{fmt(s.price,s.currency)}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13,fontWeight:700,color:s.days<=3?'var(--red)':s.days<=7?'var(--yellow)':'var(--text-2)' }}>
                    {s.days===0?'Сегодня':`${s.days} дн.`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  )
}
