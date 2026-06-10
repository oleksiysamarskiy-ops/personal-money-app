import React, { useState } from 'react'
import { useAuthStore } from '@/store/auth'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, register, error, clearError } = useAuthStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login') login(username, password)
    else register(username, password)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    background: 'var(--bg-input)', border: '1.5px solid var(--border-md)',
    color: 'var(--text)', fontSize: 15, outline: 'none', fontFamily: 'var(--font)',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 12, color: 'var(--text-3)', marginBottom: 6,
    fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100%',padding:'24px 24px 48px' }}>
      <div style={{ marginBottom:32,textAlign:'center' }}>
        <div style={{ fontSize:52,marginBottom:8 }}>💰</div>
        <div style={{ fontSize:22,fontWeight:800,letterSpacing:'-0.02em' }}>Finance</div>
        <div style={{ fontSize:13,color:'var(--text-3)',marginTop:4 }}>Ваши финансы в одном месте</div>
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
          <label style={lbl}>Логин</label>
          <input style={inp} placeholder="Введите логин" value={username}
            onChange={e=>{setUsername(e.target.value);clearError()}} autoComplete="username" />
        </div>
        <div>
          <label style={lbl}>Пароль</label>
          <input style={inp} type="password"
            placeholder={mode==='register'?'Минимум 4 символа':'Введите пароль'}
            value={password} onChange={e=>{setPassword(e.target.value);clearError()}}
            autoComplete={mode==='login'?'current-password':'new-password'} />
        </div>

        {error && (
          <div style={{ background:'var(--red-dim)',border:'1px solid var(--red)',borderRadius:10,padding:'10px 14px',fontSize:13,color:'var(--red)' }}>
            {error}
          </div>
        )}

        <button type="submit" style={{
          width:'100%',padding:'14px',borderRadius:14,background:'var(--accent)',
          border:'none',color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',
          fontFamily:'var(--font)',marginTop:4,
        }}>
          {mode==='login'?'Войти':'Создать аккаунт'}
        </button>
      </form>

      <div style={{ marginTop:24,fontSize:12,color:'var(--text-3)',textAlign:'center',maxWidth:280 }}>
        Данные хранятся локально на вашем устройстве
      </div>
    </div>
  )
}
