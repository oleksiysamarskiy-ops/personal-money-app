import React, { useState } from 'react'
import { useAuthStore } from '@/store/auth'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, register, error, loading, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login') await login(email, password)
    else await register(email, password)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    background: 'var(--bg-input)', border: '1.5px solid var(--border-md)',
    color: 'var(--text)', fontSize: 15, outline: 'none', fontFamily: 'var(--font)',
    boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 12, color: 'var(--text-3)', marginBottom: 6,
    fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100%',padding:'24px 24px 48px' }}>
      <div style={{ marginBottom:32,textAlign:'center' }}>
        <div style={{ fontSize:52,marginBottom:8 }}>💰</div>
        <div style={{ fontSize:22,fontWeight:800,letterSpacing:'-0.02em',color:'var(--text)' }}>Finance</div>
        <div style={{ fontSize:13,color:'var(--text-3)',marginTop:4 }}>Ваши финансы всегда под рукой</div>
      </div>

      <div style={{ display:'flex',background:'var(--bg-card)',borderRadius:14,padding:4,marginBottom:24,width:'100%',maxWidth:340 }}>
        {(['login','register'] as const).map(m=>(
          <button key={m} onClick={()=>{setMode(m);clearError()}} style={{
            flex:1,padding:'9px',border:'none',borderRadius:10,cursor:'pointer',
            fontFamily:'var(--font)',fontSize:14,fontWeight:600,
            background:mode===m?'var(--accent)':'transparent',
            color:mode===m?'#fff':'var(--text-3)',transition:'all 0.2s',
          }}>
            {m==='login'?'Войти':'Регистрация'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:12,width:'100%',maxWidth:340 }}>
        <div>
          <label style={lbl}>Email</label>
          <input style={inp} type="email" placeholder="you@example.com" value={email}
            onChange={e=>{setEmail(e.target.value);clearError()}} autoComplete="email" />
        </div>
        <div>
          <label style={lbl}>Пароль</label>
          <input style={inp} type="password"
            placeholder={mode==='register'?'Минимум 6 символов':'Введите пароль'}
            value={password} onChange={e=>{setPassword(e.target.value);clearError()}}
            autoComplete={mode==='login'?'current-password':'new-password'} />
        </div>

        {error && (
          <div style={{ background:'var(--red-dim)',border:'1px solid var(--red)',borderRadius:10,padding:'10px 14px',fontSize:13,color:'var(--red)' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          width:'100%',padding:'14px',borderRadius:14,background:'var(--accent)',
          border:'none',color:'#fff',fontSize:15,fontWeight:700,cursor:loading?'default':'pointer',
          fontFamily:'var(--font)',marginTop:4,opacity:loading?0.7:1,
        }}>
          {loading ? '…' : (mode==='login'?'Войти':'Создать аккаунт')}
        </button>
      </form>

      <div style={{ marginTop:24,fontSize:12,color:'var(--text-3)',textAlign:'center',maxWidth:280,lineHeight:1.6 }}>
        Данные хранятся в защищённой базе данных Supabase и привязаны к вашему аккаунту
      </div>
    </div>
  )
}
