import{useNavigate}from'react-router-dom';import{Page,TabBar,CardGroup,Cell,Badge}from'../ui'
export default function LibraryScreen(){const nav=useNavigate()
  return <Page><div style={{paddingBottom:90}}><div style={{padding:'2px 16px 12px'}}><h1 className="text-[34px] font-bold">Library</h1></div>
    <div className="px-4"><p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{color:'#8E8E93'}}>Today</p><CardGroup>
      <Cell icon="📖" iconBg="#E8F9ED" title="Surah Ash-Sharh (94:5-6)" subtitle="Verified · 2h ago" right={<Badge grade="quran"/>} onTap={()=>nav('/result/quran')}/>
      <Cell icon="📜" iconBg="#FDF8ED" title="Sahih al-Bukhari 1" subtitle="Actions judged by intentions" right={<Badge grade="sahih"/>} last onTap={()=>nav('/result/sahih')}/></CardGroup>
    <p className="text-[11px] font-bold uppercase tracking-wider mt-5 mb-2" style={{color:'#8E8E93'}}>Yesterday</p><CardGroup>
      <Cell icon="⚠️" iconBg="#FFF0EF" title="Seek knowledge in China" subtitle="Weak chain" right={<Badge grade="daif"/>} onTap={()=>nav('/result/daif')}/>
      <Cell icon="❓" iconBg="#F2F2F7" title="Unknown Statement" subtitle="Not found" right={<Badge grade="no_source"/>} last onTap={()=>nav('/result/no_source')}/></CardGroup></div>
  </div><TabBar active="library"/></Page>}
