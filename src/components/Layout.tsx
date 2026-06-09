import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/income', label: 'Income', icon: '↑' },
  { to: '/expenses', label: 'Expenses', icon: '↓' },
  { to: '/savings', label: 'Savings', icon: '⬡' },
]

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        flexShrink: 0,
      }}>
        <div style={{ marginBottom: 32, paddingLeft: 8 }}>
          <div style={{
            fontSize: '20px', fontWeight: 700,
            fontFamily: 'var(--mono)',
            color: 'var(--accent)',
            letterSpacing: '-0.02em',
          }}>
            fin<span style={{ color: 'var(--text)' }}>track</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>personal finance</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                border: isActive ? '1px solid rgba(108,99,255,0.2)' : '1px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: 16, lineHeight: 1, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingLeft: 8 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            Data stored locally
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        flex: 1,
        overflow: 'auto',
        padding: '32px 36px',
      }}>
        <Outlet />
      </main>
    </div>
  )
}
