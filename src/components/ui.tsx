import React, { useEffect } from 'react'

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string
  sub?: string
  color?: 'green' | 'red' | 'yellow' | 'accent' | 'blue'
  icon?: React.ReactNode
  full?: boolean
}

export function StatCard({ label, value, sub, color = 'accent', icon, full }: StatCardProps) {
  const colors = {
    green:  { bg: 'var(--green-dim)',  fg: 'var(--green)' },
    red:    { bg: 'var(--red-dim)',    fg: 'var(--red)' },
    yellow: { bg: 'var(--yellow-dim)', fg: 'var(--yellow)' },
    accent: { bg: 'var(--accent-dim)', fg: 'var(--accent-2)' },
    blue:   { bg: 'var(--blue-dim)',   fg: 'var(--blue)' },
  }
  const c = colors[color]
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '16px 18px',
      flex: full ? '1 1 100%' : '1 1 0',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        {icon && (
          <span style={{
            width: 30, height: 30, borderRadius: 8,
            background: c.bg, color: c.fg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>{icon}</span>
        )}
      </div>
      <div style={{
        fontSize: 24, fontWeight: 700,
        fontFamily: 'var(--mono)',
        color: 'var(--text-num)',
        letterSpacing: '-0.03em',
        lineHeight: 1,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

// ─── BottomSheet ──────────────────────────────────────────────────────────────
interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      pointerEvents: open ? 'auto' : 'none',
    }}>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0,
          transition: 'opacity 0.25s',
        }}
      />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'var(--bg-sheet)',
        borderRadius: '24px 24px 0 0',
        borderTop: '1px solid var(--border-md)',
        paddingBottom: 'calc(24px + var(--safe-bottom))',
        transform: open ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
        maxHeight: '92vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-md)' }} />
        </div>
        <div style={{ padding: '8px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 600 }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'var(--bg-input)', border: 'none', cursor: 'pointer',
            color: 'var(--text-2)', width: 32, height: 32, borderRadius: 8,
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font)',
          }}>×</button>
        </div>
        <div style={{ padding: '0 20px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── Form Field ───────────────────────────────────────────────────────────────
export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

export const fieldBase: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '13px 14px',
  color: 'var(--text)',
  fontSize: '15px',
  outline: 'none',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'full'
}
export function Btn({ variant = 'primary', size = 'md', style, children, ...props }: BtnProps) {
  const base: React.CSSProperties = {
    border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
    fontWeight: 600, borderRadius: 'var(--radius-sm)',
    fontSize: size === 'sm' ? 13 : 15,
    padding: size === 'sm' ? '8px 14px' : size === 'full' ? '15px' : '12px 22px',
    width: size === 'full' ? '100%' : undefined,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    WebkitTapHighlightColor: 'transparent',
  }
  const vars: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#fff' },
    ghost:   { background: 'var(--bg-input)', color: 'var(--text-2)', border: '1px solid var(--border)' },
    danger:  { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(242,85,90,0.2)' },
  }
  return <button {...props} style={{ ...base, ...vars[variant], ...style }}>{children}</button>
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function Empty({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 24px', color: 'var(--text-3)' }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 13 }}>{sub}</div>}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
      {action}
    </div>
  )
}

// ─── Row Item ─────────────────────────────────────────────────────────────────
interface RowProps {
  left: React.ReactNode
  center: React.ReactNode
  right: React.ReactNode
  onEdit?: () => void
  onDelete?: () => void
}
export function Row({ left, center, right, onEdit, onDelete }: RowProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center',
          padding: open ? '13px 16px 40px' : '13px 16px',
          gap: 12,
          background: open ? 'var(--bg-active)' : 'transparent',
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}
        onClick={() => setOpen(v => !v)}
      >
        <div style={{ flexShrink: 0 }}>{left}</div>
        <div style={{ flex: 1, minWidth: 0 }}>{center}</div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>{right}</div>
      </div>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 36,
            display: 'flex', borderTop: '1px solid var(--border)',
            background: 'var(--bg-active)',
          }}
        >
          <button onClick={() => { onEdit?.(); setOpen(false) }} style={{
            flex: 1, border: 'none', background: 'none',
            color: 'var(--accent-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font)',
          }}>Изменить</button>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <button onClick={() => { onDelete?.(); setOpen(false) }} style={{
            flex: 1, border: 'none', background: 'none',
            color: 'var(--red)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font)',
          }}>Удалить</button>
        </div>
      )}
    </div>
  )
}

// ─── Category Icon ────────────────────────────────────────────────────────────
export function CatIcon({ color, emoji }: { color: string; emoji: string }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: `${color}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, flexShrink: 0,
    }}>{emoji}</div>
  )
}

// ─── Amount ───────────────────────────────────────────────────────────────────
export function Amount({ value, currency, sign, color }: { value: number; currency: string; sign?: '+' | '-'; color?: string }) {
  return (
    <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 15, color: color || 'var(--text-num)', letterSpacing: '-0.02em' }}>
      {sign}{value.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
      <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.55, marginLeft: 3 }}>{currency}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function Page({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      paddingBottom: 'calc(var(--nav-h) + var(--safe-bottom) + 16px)',
    }}>
      {children}
    </div>
  )
}
