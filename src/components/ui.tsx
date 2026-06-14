import React, { useEffect } from 'react'

export function BottomSheet({ open, onClose, title, children }: { open:boolean; onClose:()=>void; title:string; children:React.ReactNode }) {
  useEffect(() => { document.body.style.overflow = open?'hidden':''; return ()=>{document.body.style.overflow=''} }, [open])
  return (
    <div style={{ position:'fixed',inset:0,zIndex:200,pointerEvents:open?'auto':'none' }}>
      <div onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(6px)',opacity:open?1:0,transition:'opacity 0.25s' }} />
      <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'var(--bg-sheet)',borderRadius:'24px 24px 0 0',borderTop:'1px solid var(--border-md)',paddingBottom:'calc(24px + var(--safe-bottom))',transform:open?'translateY(0)':'translateY(110%)',transition:'transform 0.32s cubic-bezier(0.32,0.72,0,1)',maxHeight:'92vh',overflowY:'auto' }}>
        <div style={{ display:'flex',justifyContent:'center',padding:'12px 0 4px' }}>
          <div style={{ width:36,height:4,borderRadius:2,background:'var(--border-md)' }} />
        </div>
        <div style={{ padding:'8px 20px 20px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <span style={{ fontSize:17,fontWeight:600 }}>{title}</span>
          <button onClick={onClose} style={{ background:'var(--bg-input)',border:'none',cursor:'pointer',color:'var(--text-2)',width:32,height:32,borderRadius:8,fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font)' }}>×</button>
        </div>
        <div style={{ padding:'0 20px' }}>{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, error, children }: { label:string; error?:string; children:React.ReactNode }) {
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
      <label style={{ fontSize:13,color:'var(--text-2)',fontWeight:500 }}>{label}</label>
      {children}
      {error && <span style={{ fontSize:12,color:'var(--red)' }}>{error}</span>}
    </div>
  )
}

export const fieldBase: React.CSSProperties = {
  width:'100%',background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',
  padding:'13px 14px',color:'var(--text)',fontSize:'15px',outline:'none',
  appearance:'none' as const,WebkitAppearance:'none' as const,
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?:'primary'|'ghost'|'danger'; size?:'sm'|'md'|'full' }
export function Btn({ variant='primary', size='md', style, children, ...props }: BtnProps) {
  const base: React.CSSProperties = { border:'none',cursor:'pointer',fontFamily:'var(--font)',fontWeight:600,borderRadius:'var(--radius-sm)',fontSize:size==='sm'?13:15,padding:size==='sm'?'8px 14px':size==='full'?'15px':'12px 22px',width:size==='full'?'100%':undefined,display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,WebkitTapHighlightColor:'transparent' }
  const vars: Record<string,React.CSSProperties> = { primary:{background:'var(--accent)',color:'#fff'}, ghost:{background:'var(--bg-input)',color:'var(--text-2)',border:'1px solid var(--border)'}, danger:{background:'var(--red-dim)',color:'var(--red)',border:'1px solid rgba(242,85,90,0.2)'} }
  return <button {...props} style={{ ...base,...vars[variant],...style }}>{children}</button>
}

export function Page({ children, title, action }: { children:React.ReactNode; title?:string; action?:React.ReactNode }) {
  return (
    <div style={{ flex:1,overflowY:'auto',paddingBottom:'calc(var(--nav-h) + 32px)' }}>
      {title && (
        <div style={{ padding:'56px 20px 4px',display:'flex',alignItems:'flex-end',justifyContent:'space-between' }}>
          <h1 style={{ fontSize:28,fontWeight:800,letterSpacing:'-0.03em' }}>{title}</h1>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function Card({ children, style }: { children:React.ReactNode; style?:React.CSSProperties }) {
  return <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',overflow:'hidden',...style }}>{children}</div>
}

export function SectionHead({ title }: { title:string }) {
  return <div style={{ fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10 }}>{title}</div>
}

export function Empty({ icon, title, sub }: { icon:string; title:string; sub?:string }) {
  return (
    <div style={{ textAlign:'center',padding:'48px 24px' }}>
      <div style={{ fontSize:40,marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:15,fontWeight:600,color:'var(--text-2)',marginBottom:4 }}>{title}</div>
      {sub && <div style={{ fontSize:13,color:'var(--text-3)' }}>{sub}</div>}
    </div>
  )
}

export function FAB({ onClick }: { onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{ position:'fixed',bottom:'calc(var(--nav-h) + var(--safe-bottom) + 16px)',right:20,width:52,height:52,borderRadius:'50%',background:'var(--accent)',color:'#fff',fontSize:26,border:'none',cursor:'pointer',zIndex:50,boxShadow:'0 4px 20px rgba(91,91,214,0.45)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font)',WebkitTapHighlightColor:'transparent' }}>+</button>
  )
}

interface RowProps { left:React.ReactNode; center:React.ReactNode; right:React.ReactNode; onEdit?:()=>void; onDelete?:()=>void }
export function Row({ left, center, right, onEdit, onDelete }: RowProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <div style={{ position:'relative' }}>
      <div onClick={()=>setOpen(v=>!v)} style={{ display:'flex',alignItems:'center',padding:open?'13px 16px 44px':'13px 16px',gap:12,background:open?'var(--bg-active)':'transparent',cursor:'pointer',transition:'background 0.15s' }}>
        <div style={{ flexShrink:0 }}>{left}</div>
        <div style={{ flex:1,minWidth:0 }}>{center}</div>
        <div style={{ flexShrink:0,textAlign:'right' }}>{right}</div>
      </div>
      {open && (
        <div onClick={e=>e.stopPropagation()} style={{ position:'absolute',bottom:0,left:0,right:0,height:36,display:'flex',borderTop:'1px solid var(--border)',background:'var(--bg-active)' }}>
          {onEdit && <button onClick={()=>{onEdit();setOpen(false)}} style={{ flex:1,border:'none',background:'none',color:'var(--accent-2)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'var(--font)' }}>Изменить</button>}
          {onEdit && onDelete && <div style={{ width:1,background:'var(--border)' }} />}
          {onDelete && <button onClick={()=>{onDelete();setOpen(false)}} style={{ flex:1,border:'none',background:'none',color:'var(--red)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'var(--font)' }}>Удалить</button>}
        </div>
      )}
    </div>
  )
}

export function CatIcon({ color, emoji }: { color:string; emoji:string }) {
  return <div style={{ width:40,height:40,borderRadius:12,background:`${color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>{emoji}</div>
}

export function StatCard({ label, value, sub, color='accent', icon, accent }: { label:string; value:string; sub?:string; color?:'green'|'red'|'yellow'|'accent'|'blue'|'purple'; icon?:string; accent?:string }) {
  const colorMap: Record<string,[string,string]> = { green:['var(--green-dim)','var(--green)'], red:['var(--red-dim)','var(--red)'], yellow:['var(--yellow-dim)','var(--yellow)'], accent:['var(--accent-dim)','var(--accent-2)'], blue:['var(--blue-dim)','var(--blue)'], purple:['var(--purple-dim)','var(--purple)'] }
  const [bg, fg] = colorMap[color]
  return (
    <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'16px 18px',flex:'1 1 0',minWidth:0,position:'relative',overflow:'hidden' }}>
      {accent && <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:accent }} />}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
        <span style={{ fontSize:11,color:'var(--text-3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em' }}>{label}</span>
        {icon && <span style={{ width:28,height:28,borderRadius:8,background:bg,color:fg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13 }}>{icon}</span>}
      </div>
      <div style={{ fontSize:22,fontWeight:700,fontFamily:'var(--mono)',color:'var(--text-num)',letterSpacing:'-0.03em',lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11,color:'var(--text-3)',marginTop:5 }}>{sub}</div>}
    </div>
  )
}

export function SegmentControl({ options, value, onChange }: { options:{label:string;value:string}[]; value:string; onChange:(v:string)=>void }) {
  return (
    <div style={{ display:'flex',background:'var(--bg-input)',borderRadius:'var(--radius-sm)',padding:3,gap:2 }}>
      {options.map(o => (
        <button key={o.value} onClick={()=>onChange(o.value)} style={{ flex:1,padding:'8px 4px',border:'none',borderRadius:8,background:value===o.value?'var(--bg-card)':'transparent',color:value===o.value?'var(--text)':'var(--text-3)',fontSize:13,fontWeight:value===o.value?600:500,cursor:'pointer',fontFamily:'var(--font)',transition:'all 0.15s' }}>{o.label}</button>
      ))}
    </div>
  )
}
