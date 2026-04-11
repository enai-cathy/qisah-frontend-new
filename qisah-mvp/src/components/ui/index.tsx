import{ReactNode}from'react'
import{motion}from'framer-motion'
import{useNavigate}from'react-router-dom'
import{getBadgeStyle,type Grade}from'../../data/mock'

export function Page({children,className='',bg}:{children:ReactNode;className?:string;bg?:string}){
  return <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.25}} className={`screen-scroll ${className}`} style={{background:bg||'var(--bg)'}}>{children}</motion.div>
}
export function NavBar({title,left='back',right,onClose}:{title:string;left?:'back'|'close'|'none';right?:ReactNode;onClose?:()=>void}){
  const nav=useNavigate();const go=()=>{if(onClose)onClose();else nav(-1)}
  return <nav className="blur-bar sticky top-0 z-20" style={{borderBottom:'.33px solid rgba(60,60,67,.1)'}}>
    <div className="flex items-center justify-between px-4" style={{height:44}}>
      <div className="w-[72px]">{left==='back'&&<button onClick={go} className="press-scale flex items-center gap-1.5 text-[17px] text-[#007AFF]" style={{minHeight:44}}><svg width="9" height="17" viewBox="0 0 9 17" fill="none"><path d="M8 1L1 8.5L8 16" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Back</button>}{left==='close'&&<button onClick={go} className="press-scale" style={{width:30,height:30,borderRadius:15,background:'rgba(60,60,67,.06)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round"/></svg></button>}</div>
      <span className="text-[17px] font-semibold">{title}</span>
      <div className="w-[72px] flex justify-end">{right}</div>
    </div></nav>
}
export function TabBar({active}:{active:string}){
  const nav=useNavigate()
  const tabs=[{id:'home',label:'Home',path:'/home'},{id:'library',label:'Library',path:'/library'},{id:'scan',label:'Scan',path:'/scan'},{id:'saved',label:'Saved',path:'/saved'},{id:'settings',label:'Settings',path:'/settings'}]
  return <nav className="fixed bottom-0 left-0 w-full blur-bar z-20 flex" style={{borderTop:'.33px solid rgba(60,60,67,.1)',padding:'8px 0 28px',maxWidth:390}}>
    {tabs.map(t=>{const a=t.id===active;const s=t.id==='scan'
      return <button key={t.id} onClick={()=>nav(t.path)} className="flex-1 flex flex-col items-center gap-1 press-scale" style={{minHeight:49,justifyContent:s?'flex-start':'center'}}>
        {s?<div className="gold-gradient flex items-center justify-center" style={{width:56,height:56,borderRadius:28,marginTop:-24,border:'4px solid var(--bg)',boxShadow:'0 4px 16px rgba(201,162,77,.3)'}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="9" y="1" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0"/></svg></div>
        :<div style={{width:5,height:5,borderRadius:3,background:a?'#C9A24D':'transparent'}}/>}
        <span className="text-[10px]" style={{fontWeight:a?600:500,color:a?'#C9A24D':'#AEAEB2'}}>{t.label}</span>
      </button>})}</nav>
}
export function Badge({grade,size='sm'}:{grade:Grade|'pending';size?:'sm'|'lg'}){const s=getBadgeStyle(grade);return<span className={`inline-flex items-center rounded-full font-semibold ${size==='lg'?'text-[13px] px-4 py-[5px]':'text-[11px] px-2.5 py-[3px]'}`} style={{color:s.color,background:s.bg}}>{s.label}</span>}
export function SectionHead({title,color='#C9A24D'}:{title:string;color?:string}){return<div className="flex items-center gap-2" style={{padding:'20px 16px 8px'}}><div style={{width:3,height:18,borderRadius:1.5,background:color}}/><h2 className="text-[20px] font-semibold">{title}</h2></div>}
export function CardGroup({children}:{children:ReactNode}){return<div className="bg-white overflow-hidden" style={{borderRadius:14}}>{children}</div>}
export function Cell({icon,iconBg,title,subtitle,right,last,onTap}:{icon?:string;iconBg?:string;title:string;subtitle?:ReactNode;right?:ReactNode;last?:boolean;onTap?:()=>void}){
  return <button onClick={onTap} className="flex items-center gap-3 w-full text-left press-scale" style={{padding:'11px 16px',minHeight:44,borderBottom:last?'none':'.33px solid rgba(60,60,67,.12)'}}>
    {icon&&<div className="flex items-center justify-center text-[17px] shrink-0" style={{width:36,height:36,borderRadius:8,background:iconBg}}>{icon}</div>}
    <div className="flex-1 min-w-0"><p className="text-[17px]">{title}</p>{subtitle&&<div className="text-[15px] text-[#8E8E93] mt-0.5">{subtitle}</div>}</div>
    {right||<div className="shrink-0 flex items-center justify-end" style={{minWidth:44,minHeight:44}}><svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}</button>
}
export function HeroCard({gradient,label,labelColor,title,subtitle,icon}:{gradient:string;label:string;labelColor:string;title:string;subtitle:string;icon:ReactNode}){
  return <div className="mx-4 mt-1 overflow-hidden relative" style={{borderRadius:20}}><div className="relative" style={{padding:'22px 20px',background:gradient}}><div className="geo-pattern" style={{opacity:.05}}/><div className="relative"><div className="flex items-center gap-[7px] mb-2.5">{icon}<span className="text-[13px] font-semibold" style={{color:labelColor}}>{label}</span></div><h2 className="font-serif text-[28px] font-bold text-white" style={{lineHeight:'34px'}}>{title}</h2><p className="text-[15px] mt-1.5" style={{color:'rgba(255,255,255,.78)'}}>{subtitle}</p></div></div></div>
}
export function LectureCard({l}:{l:{title:string;speaker:string;duration:string;gradient_from:string;gradient_to:string}}){
  return <div className="shrink-0 bg-white overflow-hidden press-scale" style={{width:172,borderRadius:14}}>
    <div className="flex items-center justify-center relative" style={{height:100,background:`linear-gradient(135deg,${l.gradient_from},${l.gradient_to})`}}><div style={{width:40,height:40,borderRadius:20,background:'rgba(0,0,0,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,.9)"><path d="M8 5v14l11-7z"/></svg></div><span className="absolute bottom-2 left-2 text-[11px] text-white px-1.5 py-0.5 rounded" style={{background:'rgba(0,0,0,.6)'}}>{l.duration}</span></div>
    <div style={{padding:'10px 12px'}}><p className="text-[13px] font-semibold" style={{lineHeight:1.4}}>{l.title}</p><p className="text-[12px] text-[#8E8E93] mt-1">{l.speaker}</p></div></div>
}
export function CautionBanner({title,text,variant='red'}:{title:string;text:string;variant?:'red'|'amber'}){
  const c=variant==='red'?{bg:'#FFF0EF',border:'#C94A4A',color:'#C94A4A'}:{bg:'#FFF8ED',border:'#E6B65C',color:'#CC7A00'}
  return <div className="mx-4 mt-3" style={{borderRadius:14,padding:'16px 18px',background:c.bg,borderLeft:`4px solid ${c.border}`}}><p className="text-[12px] font-bold mb-1.5" style={{letterSpacing:'.6px',color:c.color}}>{title}</p><p className="text-[15px] text-[#2A2A24]" style={{lineHeight:'22px'}}>{text}</p></div>
}
export function SegControl({items,active,onChange}:{items:string[];active:number;onChange:(i:number)=>void}){
  return <div className="flex" style={{background:'rgba(118,118,128,.12)',borderRadius:8.91,padding:2}}>{items.map((item,i)=><button key={item} onClick={()=>onChange(i)} className="flex-1 text-center text-[13px] font-semibold py-1.5" style={{borderRadius:6.93,color:active===i?'#0F0F0C':'#636366',background:active===i?'#fff':'transparent',boxShadow:active===i?'0 1px 4px rgba(0,0,0,.04)':'none'}}>{item}</button>)}</div>
}
