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
    <div style={{ display:'flex',flexDirection:'column',height:'100%',position:'relative' }}>
      <div style={{ flex:1,overflowY:'auto',paddingBottom:'calc(var(--nav-h) + var(--safe-bottom) + 8px)' }}>
        <Outlet />
      </div>
      <nav style={{
        position:'fixed',
        bottom:0,
        left:'50%',
        transform:'translateX(-50%)',
        width:'100%',
        maxWidth:430,
        height:'calc(var(--nav-h) + var(--safe-bottom))',
        paddingBottom:'var(--safe-bottom)',
        background:'rgba(10,10,15,0.96)',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        borderTop:'1px solid var(--border)',
        display:'flex',
        alignItems:'flex-start',
        paddingTop:6,
        zIndex:100,
      }}>
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to==='/'}
            style={({isActive}) => ({
              flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,
              padding:'6px 0',textDecoration:'none',
              color:isActive?'var(--accent-2)':'var(--text-3)',
              transition:'color 0.15s',WebkitTapHighlightColor:'transparent',
              position:'relative',
            })}
          >
            {({isActive}) => (
              <>
                <span style={{ fontSize:19,lineHeight:1 }}>{tab.icon}</span>
                <span style={{ fontSize:9,fontWeight:600,letterSpacing:'0.02em' }}>{tab.label}</span>
                {isActive && <div style={{ position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:4,height:4,borderRadius:'50%',background:'var(--accent-2)' }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
