import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to:'/',         label:'Обзор',   icon:'◈' },
  { to:'/income',   label:'Доходы',  icon:'↑' },
  { to:'/expenses', label:'Расходы', icon:'↓' },
  { to:'/savings',  label:'Кошель',  icon:'⬡' },
  { to:'/more',     label:'Ещё',     icon:'⋯' },
]

export default function Layout() {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <Outlet />
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        /* nav bar height + 16px visual gap + iOS home indicator */
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(10,10,15,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: 10,
        zIndex: 100,
      }}>
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              textDecoration: 'none',
              color: isActive ? 'var(--accent-2)' : 'var(--text-3)',
              transition: 'color 0.15s',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.02em' }}>{tab.label}</span>
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: -10,
                    width: 20,
                    height: 2,
                    borderRadius: 1,
                    background: 'var(--accent-2)',
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
