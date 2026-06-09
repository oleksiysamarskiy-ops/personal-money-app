import React from 'react'

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string
  value: string
  sub?: string
  color?: 'green' | 'red' | 'yellow' | 'accent' | 'blue'
  icon?: string
}

export function StatCard({ title, value, sub, color = 'accent', icon }: StatCardProps) {
  const colorMap = {
    green: { glow: 'var(--green-glow)', accent: 'var(--green)' },
    red: { glow: 'var(--red-glow)', accent: 'var(--red)' },
    yellow: { glow: 'var(--yellow-glow)', accent: 'var(--yellow)' },
    accent: { glow: 'var(--accent-glow)', accent: 'var(--accent)' },
    blue: { glow: 'rgba(59,130,246,0.12)', accent: 'var(--blue)' },
  }
  const c = colorMap[color]

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: c.accent,
        opacity: 0.8,
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)', lineHeight: 1 }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
        </div>
        {icon && (
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: c.glow,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      />
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px',
        width: '100%', maxWidth: 480,
        margin: '0 16px',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 20, lineHeight: 1,
            padding: '4px 8px', borderRadius: 6,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Form fields ──────────────────────────────────────────────────────────────
const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 14px',
  color: 'var(--text)',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s',
}

export const inputStyle = fieldStyle
export const selectStyle = { ...fieldStyle, cursor: 'pointer' }
export const textareaStyle = { ...fieldStyle, resize: 'vertical' as const, minHeight: 80 }

export function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 500 }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Btn({ variant = 'primary', size = 'md', children, style, ...props }: BtnProps) {
  const base: React.CSSProperties = {
    border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
    fontWeight: 500, borderRadius: 'var(--radius-sm)',
    transition: 'opacity 0.15s, background 0.15s',
    fontSize: size === 'sm' ? '12px' : '14px',
    padding: size === 'sm' ? '6px 12px' : '10px 20px',
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#fff' },
    ghost: { background: 'var(--bg-hover)', color: 'var(--text-dim)', border: '1px solid var(--border)' },
    danger: { background: 'var(--red-glow)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' },
  }
  return <button {...props} style={{ ...base, ...variants[variant], ...style }}>{children}</button>
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      color: 'var(--text-muted)',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: '14px' }}>{message}</div>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block',
      background: color ? `${color}22` : 'var(--bg-hover)',
      color: color || 'var(--text-dim)',
      border: `1px solid ${color ? `${color}44` : 'var(--border)'}`,
      borderRadius: 6, padding: '2px 8px',
      fontSize: '12px', fontWeight: 500,
    }}>
      {label}
    </span>
  )
}
