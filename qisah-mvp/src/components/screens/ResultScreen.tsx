import{useParams,useNavigate}from'react-router-dom';import{useState,useRef,useCallback}from'react';import{gradeConfigs,type Grade}from'../../data/mock';import{getHadithByGrade,getLecturesByContent,getScholarsByHadith,getTafsirByVerse,scholars as allScholars}from'../../data/database';import{Page,NavBar,HeroCard,SectionHead,LectureCard,CautionBanner,SegControl,Badge}from'../ui';import{useApp}from'../../hooks/useAppState'
export default function ResultScreen(){
  const{grade='sahih'}=useParams<{grade:string}>();const g=gradeConfigs[grade as Grade]||gradeConfigs.sahih;const nav=useNavigate()
  const{triggerShare,addSave,removeSave,isSaved,setToast}=useApp()
  const[seg,setSeg]=useState(0);const[exp,setExp]=useState(false)
  const r0=useRef<HTMLDivElement>(null),r1=useRef<HTMLDivElement>(null),r2=useRef<HTMLDivElement>(null),r3=useRef<HTMLDivElement>(null)
  const refs=[r0,r1,r2,r3]
  const handleSeg=useCallback((i:number)=>{setSeg(i);refs[i]?.current?.scrollIntoView({behavior:'smooth',block:'start'})},[])
  const isDaif=grade==='daif',isNoSrc=grade==='no_source',isQuran=grade==='quran',isMukh=grade==='mukhtalaf',isHasan=grade==='hasan'
  const hadith=getHadithByGrade(grade as any)
  const relLectures=getLecturesByContent(hadith?.id||'h1')
  const relScholars=getScholarsByHadith(hadith?.id||'h1')

  const heroLabel=isDaif?'Weak Chain':isMukh?'Scholars Disagree':isNoSrc?'Not Found':isQuran?'Authentic Revelation':isHasan?'Good Chain':'Authentic Chain'
  const checkI=<svg width="16" height="16" viewBox="0 0 24 24" fill={g.secondaryColor}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  const warnI=<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={g.secondaryColor} strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
  const arab=isQuran?'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا':hadith?.arabic_text||''
  const eng=isNoSrc?'"Love your children dearly, for they will be light..."':isQuran?'"Verily, with hardship comes ease."':hadith?.english_text||''
  const src=isQuran?'The Holy Quran, Surah Ash-Sharh, Verses 5-6':isNoSrc?'':hadith?.source||''
  const resultId=`${grade}-result`;const saved=isSaved(resultId)
  const handleSave=()=>{if(saved){removeSave(resultId);setToast('Removed from saved')}else{addSave({id:resultId,grade:grade as Grade,title:eng.slice(1,40)+'…',source:src,savedAt:'Just now'});setToast('Saved to library')}}
  const handleShare=()=>triggerShare(`${g.label} — Verified by Qisah`,`${eng}\n\nSource: ${src}\nGrade: ${g.label}\n\nVerified by Qisah — qisah.app`)
  const primaryBg=isDaif||isNoSrc?'#0F0F0C':isMukh?'#7B68A8':isQuran?'#1B6B3A':'linear-gradient(135deg,#C9A24D,#E6B65C)'
  const primaryLabel=isNoSrc?'Report Correction':isQuran?'View Tafsir':'View Chain'
  const primaryAction=()=>{if(isQuran)nav('/tafsir/q1');else if(isNoSrc)nav('/home');else nav(`/chain/${grade}`)}
  const noteColor=isDaif||isNoSrc?'#C94A4A':isQuran||grade==='sahih'?'#3E7C59':'#CC7A00'
  const noteBg=isDaif||isNoSrc?'#FFF0EF':isQuran?'#E8F9ED':'#FFF8ED'

  return <Page bg={isNoSrc?'#EFECE7':undefined}>
    <NavBar title="Context Result" left="close" onClose={()=>nav('/home')}/>
    <div className="flex justify-center" style={{padding:'8px 0 4px'}}><Badge grade={grade as Grade} size="lg"/></div>
    <HeroCard gradient={g.gradient} label={heroLabel} labelColor={g.secondaryColor} title={g.heroTitle} subtitle={g.heroSubtitle} icon={(isDaif||isNoSrc||isMukh)?warnI:checkI}/>
    <div className="px-4 sticky top-[44px] z-10 blur-bar" style={{padding:'8px 16px 10px',borderBottom:'.33px solid rgba(60,60,67,.1)'}}><SegControl items={isQuran?['Verse','Tafsir','Context','Lectures']:['Grade','Scholars','Context','Lectures']} active={seg} onChange={handleSeg}/></div>

    {/* GRADE */}
    <div ref={r0} style={{scrollMarginTop:100}}>
      {(isDaif||isNoSrc)&&<CautionBanner title="⚠ Exercise caution" text={isDaif?'This narration has known chain weaknesses.':'No verifiable chain. Do not attribute to the Prophet ﷺ.'}/>}
      <div className="mx-4 mt-3 bg-white overflow-hidden" style={{borderRadius:14}}><div className="flex"><div className="shrink-0" style={{width:4,background:isNoSrc?'#AEAEB2':g.accentColor}}/><div style={{padding:'16px 18px',flex:1}}>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{color:isNoSrc?'#AEAEB2':g.accentColor}}>Analyzed Statement</p>
        {!isNoSrc&&arab&&<p className="font-arabic font-bold text-center" style={{fontSize:isQuran?26:22,lineHeight:isQuran?'56px':'48px',color:'#2A2A24'}}>{arab}</p>}
        <div style={{height:'.33px',background:'rgba(60,60,67,.12)',margin:'12px 0'}}/><p className="font-serif italic" style={{fontSize:16,lineHeight:1.55}}>{eng}</p>
        {src&&<p className="text-[13px] mt-3" style={{color:'#636366'}}>📖 {src}</p>}
      </div></div></div>
      {!isQuran&&!isNoSrc&&<><SectionHead title="Grading Breakdown" color={g.accentColor}/><div className="flex gap-2.5 px-4"><div className="flex-1 bg-white" style={{borderRadius:14,padding:'14px 16px'}}><p className="text-[10px] font-bold uppercase mb-2" style={{color:'#8E8E93'}}>🔗 Chain (Isnad)</p><p className="text-[16px] font-bold" style={{color:isDaif?'#C94A4A':isHasan?'#C9A24D':isMukh?'#7B68A8':'#3E7C59'}}>{hadith?.chain_strength}</p><p className="text-[12px] mt-1" style={{color:'#636366',lineHeight:'17px'}}>{hadith?.chain_description?.slice(0,60)}</p></div><div className="flex-1 bg-white" style={{borderRadius:14,padding:'14px 16px'}}><p className="text-[10px] font-bold uppercase mb-2" style={{color:'#8E8E93'}}>📝 Text (Matn)</p><p className="text-[16px] font-bold" style={{color:'#3E7C59'}}>{hadith?.text_strength}</p><p className="text-[12px] mt-1" style={{color:'#636366',lineHeight:'17px'}}>{hadith?.text_description?.slice(0,60)}</p></div></div></>}
      {isQuran&&<><SectionHead title="Surah Information" color="#3E7C59"/><div className="flex gap-2.5 px-4"><div className="flex-1 bg-white" style={{borderRadius:14,padding:'14px 16px'}}><p className="text-[10px] font-bold uppercase mb-2" style={{color:'#8E8E93'}}>📖 Surah</p><p className="text-[16px] font-bold" style={{color:'#3E7C59'}}>Ash-Sharh</p><p className="text-[12px] mt-1" style={{color:'#636366'}}>The Relief. #94</p></div><div className="flex-1 bg-white" style={{borderRadius:14,padding:'14px 16px'}}><p className="text-[10px] font-bold uppercase mb-2" style={{color:'#8E8E93'}}>🕌 Revelation</p><p className="text-[16px] font-bold" style={{color:'#3E7C59'}}>Makkan</p><p className="text-[12px] mt-1" style={{color:'#636366'}}>8 verses. Early Period</p></div></div></>}
      {isNoSrc&&<><SectionHead title="Authentic Alternative" color="#3E7C59"/><div className="px-4"><div style={{borderRadius:14,padding:'16px 18px',background:'#E8F9ED'}}><p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{color:'#3E7C59'}}>💚 Verified hadith on same topic</p><p className="font-arabic text-[18px] font-bold text-center" style={{lineHeight:'40px',color:'#2A2A24'}}>مَنْ لَمْ يَرْحَمْ صَغِيرَنَا فَلَيْسَ مِنَّا</p><div style={{height:'.33px',background:'rgba(62,124,89,.15)',margin:'8px 0'}}/><p className="font-serif text-[15px] italic" style={{lineHeight:1.55}}>"Whoever does not show mercy to our young ones is not one of us."</p><p className="text-[13px] mt-2" style={{color:'#636366'}}>📖 Abu Dawud · <span className="font-semibold text-[#3E7C59]">Sahih</span></p></div></div></>}
    </div>

    {/* SCHOLARS */}
    <div ref={r1} style={{scrollMarginTop:100}}>
      {!isNoSrc&&!isQuran&&<><SectionHead title={isMukh?'Scholarly Spectrum':'Scholarly Opinions'} color={g.accentColor}/>
        <div className="px-4">{!isMukh&&<div className="flex items-center gap-2 mb-2.5" style={{borderRadius:12,padding:'12px 16px',background:g.accentBg}}><svg width="16" height="16" viewBox="0 0 24 24" fill={g.accentColor}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span className="text-[14px] font-semibold" style={{color:g.accentColor}}>{isDaif?'Majority grade as Daif':isHasan?'Majority grade: Hasan':'All major schools agree: Sahih'}</span></div>}
          {isMukh&&<div className="bg-white mb-3" style={{borderRadius:14,padding:16}}><div className="mb-2" style={{height:6,borderRadius:3,background:'linear-gradient(90deg,#3E7C59 28%,#C9A24D 50%,#C94A4A 72%)'}}/><div className="flex justify-between"><span className="text-[12px] font-semibold" style={{color:'#3E7C59'}}>Sahih (2)</span><span className="text-[12px] font-semibold" style={{color:'#C9A24D'}}>Hasan (3)</span><span className="text-[12px] font-semibold" style={{color:'#C94A4A'}}>Da'if (2)</span></div></div>}
          {relScholars.slice(0,4).map((s,i)=><button key={s.id} onClick={()=>nav('/scholar/'+s.id)} className="bg-white flex items-center gap-3 mb-1.5 w-full text-left press-scale" style={{borderRadius:12,padding:'12px 16px',border:i===0?'1px solid #E6B65C':undefined}}><div className="shrink-0 flex items-center justify-center text-[12px] font-bold" style={{width:32,height:32,borderRadius:16,background:s.bg_color,color:s.color}}>{s.initial}</div><div className="flex-1"><p className="text-[15px] font-medium">{s.name}</p>{i===0&&<p className="text-[11px] mt-0.5" style={{color:'#8E8E93'}}>{s.work} · <span className="font-semibold" style={{color:g.accentColor}}>{g.label}</span></p>}</div><span className="text-[10px] font-bold uppercase" style={{color:'#8E8E93'}}>{s.school}</span><svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>)}</div></>}
      {isQuran&&<><SectionHead title="Tafsir Sources" color="#3E7C59"/><div className="px-4"><div className="bg-white overflow-hidden" style={{borderRadius:14}}>{getTafsirByVerse('q1').map((t,i,a)=><button key={t.id} onClick={()=>nav('/tafsir/q1')} className="flex items-center gap-3 w-full text-left press-scale" style={{padding:'12px 16px',borderBottom:i<a.length-1?'.33px solid rgba(60,60,67,.12)':'none'}}><div className="shrink-0 flex items-center justify-center text-[11px] font-bold" style={{width:32,height:32,borderRadius:16,background:t.bg,color:t.color}}>{t.initial}</div><div className="flex-1"><p className="text-[15px] font-medium">{t.source}</p><p className="text-[12px]" style={{color:'#8E8E93'}}>{t.type}</p></div><svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>)}</div></div></>}
    </div>

    {/* CONTEXT */}
    <div ref={r2} style={{scrollMarginTop:100}}>
      <SectionHead title={isNoSrc?'Why This Matters':isQuran?'Reason for Revelation':'Context & Interpretation'} color={isNoSrc?'#C94A4A':g.accentColor}/>
      <div className="px-4"><div className="bg-white" style={{borderRadius:14,padding:18}}>
        <p className="text-[15px]" style={{color:'#2A2A24',lineHeight:1.6}}>{hadith?.context||'This surah was revealed to rescue the Prophet ﷺ during difficulty in Makkah.'}</p>
        <div className="mt-3.5" style={{borderRadius:12,padding:'14px 16px',borderLeft:`3px solid ${noteColor}`,background:noteBg}}><p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{color:noteColor}}>{hadith?.note_title||'📖 Key insight'}</p><p className="text-[13px]" style={{color:'#2A2A24',lineHeight:'20px'}}>{hadith?.note_text||'The Arabic uses definite article for hardship but indefinite for ease.'}</p></div>
      </div></div>
    </div>

    {/* LECTURES */}
    <div ref={r3} style={{scrollMarginTop:100}}>
      <SectionHead title="Related Lectures"/>
      <div className="flex gap-2.5 px-4 overflow-x-auto pb-2" style={{scrollbarWidth:'none'}}>{relLectures.map(l=><LectureCard key={l.id} l={l}/>)}</div>
    </div>

    <div className="text-center mt-4 mb-2"><span className="text-[13px]" style={{color:'#8E8E93'}}>Found an error? <button className="font-medium" style={{color:'#C94A4A'}}>Report a correction</button></span></div>

    {/* ACTION BAR */}
    <div className="flex items-center gap-2.5 sticky bottom-0 z-10 blur-bar" style={{padding:'12px 16px 28px',borderTop:'.33px solid rgba(60,60,67,.1)'}}>
      <button onClick={handleShare} className="press-scale shrink-0 flex items-center justify-center" style={{width:48,height:48,borderRadius:24,background:'#fff',border:'1px solid #E5E5EA'}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="1.8" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></button>
      <button onClick={handleSave} className="press-scale shrink-0 flex items-center justify-center" style={{width:48,height:48,borderRadius:24,background:saved?'#FDF8ED':'#fff',border:`1px solid ${saved?'#C9A24D':'#E5E5EA'}`}}><svg width="18" height="18" viewBox="0 0 24 24" fill={saved?'#C9A24D':'none'} stroke={saved?'#C9A24D':'#636366'} strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></button>
      <button onClick={primaryAction} className="press-scale flex-1 flex items-center justify-center gap-2" style={{height:48,borderRadius:14,background:primaryBg,border:'none'}}><span className="text-[16px] font-semibold text-white">{primaryLabel}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
    </div>
  </Page>}
