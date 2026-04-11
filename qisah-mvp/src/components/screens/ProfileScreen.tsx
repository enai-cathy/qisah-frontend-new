import{useState}from'react'
import{useNavigate}from'react-router-dom'
import{Page,NavBar,CardGroup,Cell}from'../ui'
import{useApp}from'../../hooks/useAppState'
import{getUsers}from'../../data/database'

export default function ProfileScreen(){
  const nav=useNavigate()
  const{currentUser,setCurrentUser,showToast,saved,isPro}=useApp()
  const u=currentUser
  const[editing,setEditing]=useState(false)
  const[username,setUsername]=useState(u?.username||'')
  const[email,setEmail]=useState(u?.email||'')
  const[error,setError]=useState('')

  const handleSave=()=>{
    if(!username||username.length<3){setError('Username must be at least 3 characters');return}
    if(!email||!email.includes('@')){setError('Invalid email');return}
    // Check duplicates
    const existing=getUsers().find(x=>x.id!==u?.id&&(x.email===email||x.username===username))
    if(existing){setError(existing.email===email?'Email already taken':'Username already taken');return}
    // Update in mock DB
    if(u){
      const dbUser=getUsers().find(x=>x.id===u.id)
      if(dbUser){(dbUser as any).username=username;(dbUser as any).email=email}
      setCurrentUser({...u,username,email})
    }
    setEditing(false);setError('');showToast('Profile updated')
  }

  const initials=(u?.username||'AA').slice(0,2).toUpperCase()

  return(
    <Page>
      <NavBar title="Profile" right={!editing?<button onClick={()=>setEditing(true)} className="text-[15px] font-medium" style={{color:'#007AFF'}}>Edit</button>:<button onClick={handleSave} className="text-[15px] font-semibold" style={{color:'#007AFF'}}>Save</button>}/>

      <div className="text-center" style={{padding:'24px 32px'}}>
        <div className="inline-flex items-center justify-center mb-3 font-serif text-[26px] font-bold" style={{width:80,height:80,borderRadius:40,background:'linear-gradient(135deg,rgba(230,182,92,.2),rgba(201,162,77,.12))',border:'3px solid rgba(201,162,77,.2)',color:'#8B6D1F'}}>{initials}</div>
        {!editing&&<>
          <h1 className="text-[22px] font-bold">{u?.username||'Guest'}</h1>
          <p className="text-[14px] mt-1" style={{color:'#8E8E93'}}>{u?.email||'Not signed in'}</p>
          <div className="flex justify-center gap-2 mt-2">
            {isPro&&<span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{background:'#FDF8ED',color:'#C9A24D'}}>Pro Member</span>}
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{background:'#E8F9ED',color:'#3E7C59'}}>Verified</span>
          </div>
        </>}
      </div>

      {editing&&<div className="px-4 mb-4">
        {error&&<div className="mb-3" style={{padding:'10px 14px',borderRadius:10,background:'#FFF0EF'}}><p className="text-[13px] font-medium" style={{color:'#C94A4A'}}>{error}</p></div>}
        <div className="bg-white overflow-hidden" style={{borderRadius:14,border:'.5px solid #D1D1D6'}}>
          <div style={{padding:'12px 16px',borderBottom:'.33px solid rgba(60,60,67,.12)'}}>
            <label className="block text-[12px] mb-1" style={{color:'#AEAEB2'}}>Username</label>
            <input value={username} onChange={e=>{setUsername(e.target.value);setError('')}} className="text-[17px] w-full outline-none bg-transparent"/>
          </div>
          <div style={{padding:'12px 16px',borderBottom:'.33px solid rgba(60,60,67,.12)'}}>
            <label className="block text-[12px] mb-1" style={{color:'#AEAEB2'}}>Email</label>
            <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('')}} className="text-[17px] w-full outline-none bg-transparent"/>
          </div>
          <div style={{padding:'12px 16px'}}>
            <label className="block text-[12px] mb-1" style={{color:'#AEAEB2'}}>Password</label>
            <button onClick={()=>nav('/forgot-password')} className="text-[15px] font-medium" style={{color:'#007AFF'}}>Change password →</button>
          </div>
        </div>
      </div>}

      {!editing&&<>
        <div className="flex gap-2 px-4 mb-5">
          {[[String(saved.length),'Saved','#C9A24D'],['42','Verified','#3E7C59'],['3','Reported','#636366']].map(([n,l,c])=>
            <div key={l} className="flex-1 bg-white text-center" style={{borderRadius:14,padding:'14px 8px'}}><p className="text-[20px] font-bold" style={{color:c}}>{n}</p><p className="text-[11px] mt-0.5" style={{color:'#8E8E93'}}>{l}</p></div>
          )}
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wider px-4 mb-2" style={{color:'#8E8E93'}}>Account</p>
        <div className="px-4 mb-5"><CardGroup>
          <Cell icon="🔐" iconBg="#FDF8ED" title="Change Password" onTap={()=>nav('/forgot-password')}/>
          <Cell icon="📱" iconBg="#E6F1FB" title="Manage Subscriptions" onTap={()=>nav('/paywall')}/>
          <Cell icon="🗑️" iconBg="#FFF0EF" title="Delete Account" last onTap={()=>showToast('Contact support to delete account')}/>
        </CardGroup></div>
        <div className="px-4">
          <button onClick={()=>{setCurrentUser(null);nav('/signup')}} className="w-full press-scale flex items-center justify-center" style={{height:48,borderRadius:14,background:'#FFF0EF',border:'none'}}>
            <span className="text-[16px] font-semibold" style={{color:'#C94A4A'}}>Sign Out</span>
          </button>
        </div>
      </>}
    </Page>
  )
}
