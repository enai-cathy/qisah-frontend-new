import{useNavigate,useParams}from'react-router-dom';import{Page,NavBar,SectionHead}from'../ui';import{getTafsirByVerse,getQuranVerse}from'../../data/database'
export default function TafsirScreen(){const nav=useNavigate();const{verseId='q1'}=useParams();const verse=getQuranVerse(verseId);const tafsirs=getTafsirByVerse(verseId)
  return <Page><NavBar title="Tafsir"/>
    {verse&&<div className="mx-4 mt-3 bg-white overflow-hidden" style={{borderRadius:14}}><div className="flex"><div className="shrink-0" style={{width:4,background:'#3E7C59'}}/><div style={{padding:'16px 18px'}}><p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{color:'#3E7C59'}}>Surah {verse.surah_name} ({verse.surah_number}:{verse.verse_range})</p><p className="font-arabic text-[22px] font-bold text-center" style={{lineHeight:'48px',color:'#2A2A24'}}>{verse.arabic_text}</p><div style={{height:'.33px',background:'rgba(60,60,67,.12)',margin:'12px 0'}}/><p className="font-serif text-[15px] italic" style={{lineHeight:1.55}}>{verse.translation}</p></div></div></div>}
    <SectionHead title="Tafsir Sources" color="#3E7C59"/>
    {tafsirs.map(t=><div key={t.id} className="mx-4 mb-3 bg-white" style={{borderRadius:14,padding:'16px 18px'}}>
      <div className="flex items-center gap-2.5 mb-3"><div className="flex items-center justify-center text-[11px] font-bold shrink-0" style={{width:32,height:32,borderRadius:16,background:t.bg,color:t.color}}>{t.initial}</div><div><p className="text-[16px] font-semibold">{t.source}</p><p className="text-[12px]" style={{color:'#8E8E93'}}>{t.author} · {t.type}</p></div></div>
      <p className="text-[15px]" style={{color:'#2A2A24',lineHeight:1.6}}>{t.content}</p>
    </div>)}
    {verse&&<><SectionHead title="Reason for Revelation" color="#3E7C59"/><div className="mx-4 bg-white" style={{borderRadius:14,padding:'16px 18px'}}><p className="text-[15px]" style={{color:'#2A2A24',lineHeight:1.6}}>{verse.reason_for_revelation}</p></div></>}</Page>}
