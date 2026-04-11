import{useState}from'react'
import{useNavigate}from'react-router-dom'
import{Page}from'../ui'
import{createUser,loginUser}from'../../data/database'
import{useApp}from'../../hooks/useAppState'

export default function SignUpScreen(){
  const nav=useNavigate()
  const{setCurrentUser,showToast}=useApp()
  const[mode,setMode]=useState<'signup'|'signin'>('signup')
  const[username,setUsername]=useState('')
  const[email,setEmail]=useState('')
  const[password,setPassword]=useState('')
  const[error,setError]=useState('')
  const[loading,setLoading]=useState(false)

  const handleSubmit=()=>{
    setError('')
    setLoading(true)
    setTimeout(()=>{
      if(mode==='signup'){
        const res=createUser(username,email,password)
        if(!res.success){setError(res.error||'');setLoading(false);return}
        setCurrentUser(res.user!);showToast('Account created!');nav('/home')
      }else{
        const res=loginUser(email,password)
        if(!res.success){setError(res.error||'');setLoading(false);return}
        setCurrentUser(res.user!);showToast('Welcome back!');nav('/home')
      }
      setLoading(false)
    },600)
  }

  const mockSocial=(provider:string)=>{
    setLoading(true)
    setTimeout(()=>{
      const u={id:'social_'+Date.now(),username:provider+'_user',email:provider+'@mock.com',password:'',createdAt:new Date().toISOString(),madhab:'shafii',isPro:false,isSuspended:false}
      setCurrentUser(u);showToast(`Signed in with ${provider}`);nav('/home');setLoading(false)
    },800)
  }

  return(
    <Page className="h-full flex flex-col">
      <div className="flex justify-end" style={{padding:'12px 20px 0'}}>
        <button onClick={()=>nav('/home')} className="text-[15px]" style={{color:'#8E8E93',minHeight:44}}>Skip</button>
      </div>

      <div className="text-center" style={{padding:'12px 32px 24px'}}>
        <div className="inline-flex items-center justify-center mb-4" style={{width:72,height:72,borderRadius:20,background:'linear-gradient(145deg,#D4AD4E,#E6C05C)',boxShadow:'0 8px 28px rgba(201,162,77,.2)'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v20M8 5v14M4 8v8M16 5v14M20 8v8"/></svg>
        </div>
        <h1 className="font-serif text-[28px] font-bold">{mode==='signup'?'Create Account':'Welcome Back'}</h1>
        <p className="text-[15px] mt-1.5" style={{color:'#636366',lineHeight:'22px'}}>
          {mode==='signup'?'Verify Islamic knowledge with authentic, traceable sources':'Sign in to continue your journey'}
        </p>
      </div>

      <div style={{padding:'0 20px',flex:1}}>
        {/* Social buttons */}
        <button onClick={()=>mockSocial('Apple')} className="w-full flex items-center justify-center gap-2 press-scale mb-2.5" style={{height:52,borderRadius:14,background:'#000',border:'none'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
          <span className="text-[17px] font-semibold text-white">Continue with Apple</span>
        </button>
        <button onClick={()=>mockSocial('Google')} className="w-full flex items-center justify-center gap-2 press-scale" style={{height:52,borderRadius:14,background:'#fff',border:'.5px solid #D1D1D6'}}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          <span className="text-[17px] font-semibold" style={{color:'#2A2A24'}}>Continue with Google</span>
        </button>

        <div className="flex items-center gap-4 my-5"><div className="flex-1" style={{height:'.33px',background:'#D1D1D6'}}/><span className="text-[13px]" style={{color:'#AEAEB2'}}>or</span><div className="flex-1" style={{height:'.33px',background:'#D1D1D6'}}/></div>

        {/* Error message */}
        {error&&<div className="mb-3 flex items-start gap-2" style={{padding:'12px 14px',borderRadius:12,background:'#FFF0EF',borderLeft:'3px solid #C94A4A'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C94A4A" strokeWidth="2" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="text-[14px] font-medium" style={{color:'#C94A4A'}}>{error}</p>
        </div>}

        {/* Form */}
        <div className="bg-white overflow-hidden mb-4" style={{borderRadius:14,border:error?'1px solid #C94A4A':'.5px solid #D1D1D6'}}>
          {mode==='signup'&&<div style={{padding:'12px 16px',borderBottom:'.33px solid rgba(60,60,67,.12)'}}>
            <label className="block text-[12px] mb-1" style={{color:'#AEAEB2'}}>Username</label>
            <input value={username} onChange={e=>{setUsername(e.target.value);setError('')}} placeholder="e.g. ahmed_ali" className="text-[17px] w-full outline-none bg-transparent placeholder-[#C7C7CC]"/>
          </div>}
          <div style={{padding:'12px 16px',borderBottom:'.33px solid rgba(60,60,67,.12)'}}>
            <label className="block text-[12px] mb-1" style={{color:'#AEAEB2'}}>Email</label>
            <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('')}} placeholder="you@example.com" className="text-[17px] w-full outline-none bg-transparent placeholder-[#C7C7CC]"/>
          </div>
          <div style={{padding:'12px 16px'}}>
            <label className="block text-[12px] mb-1" style={{color:'#AEAEB2'}}>Password</label>
            <input type="password" value={password} onChange={e=>{setPassword(e.target.value);setError('')}} placeholder="Min 6 characters" className="text-[17px] w-full outline-none bg-transparent placeholder-[#C7C7CC]"/>
          </div>
        </div>

        {mode==='signin'&&<div className="text-right mb-4"><button onClick={()=>nav('/forgot-password')} className="text-[14px] font-medium" style={{color:'#007AFF'}}>Forgot password?</button></div>}

        <button onClick={handleSubmit} disabled={loading} className="w-full press-scale flex items-center justify-center" style={{height:52,borderRadius:14,background:'linear-gradient(135deg,#C9A24D,#E6B65C)',border:'none',opacity:loading?.6:1}}>
          <span className="text-[17px] font-semibold text-white">{loading?'Please wait…':mode==='signup'?'Create Account':'Sign In'}</span>
        </button>
      </div>

      <div className="text-center" style={{padding:'16px 32px 28px'}}>
        <button onClick={()=>{setMode(mode==='signup'?'signin':'signup');setError('')}}>
          <span className="text-[14px]" style={{color:'#8E8E93'}}>{mode==='signup'?'Already have an account?':'New to Qisah?'} </span>
          <span className="text-[14px] font-semibold" style={{color:'#007AFF'}}>{mode==='signup'?'Sign In':'Create Account'}</span>
        </button>
        <p className="text-[11px] mt-3" style={{color:'#AEAEB2',lineHeight:'16px'}}>By continuing, you agree to our <span style={{color:'#007AFF'}}>Terms</span> and <span style={{color:'#007AFF'}}>Privacy Policy</span></p>
      </div>
    </Page>
  )
}
