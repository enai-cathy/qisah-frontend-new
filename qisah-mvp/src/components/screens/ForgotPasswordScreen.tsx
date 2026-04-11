import{useState}from'react'
import{useNavigate}from'react-router-dom'
import{Page,NavBar}from'../ui'
import{useApp}from'../../hooks/useAppState'
import{getUsers}from'../../data/database'

type Step='email'|'otp'|'reset'|'done'

export default function ForgotPasswordScreen(){
  const nav=useNavigate()
  const{generateOTP,verifyOTP,showToast}=useApp()
  const[step,setStep]=useState<Step>('email')
  const[email,setEmail]=useState('')
  const[otp,setOtp]=useState('')
  const[newPass,setNewPass]=useState('')
  const[confirmPass,setConfirmPass]=useState('')
  const[error,setError]=useState('')
  const[generatedCode,setGeneratedCode]=useState('')

  const handleEmail=()=>{
    if(!email||!email.includes('@')){setError('Please enter a valid email');return}
    const user=getUsers().find(u=>u.email===email)
    if(!user){setError('No account found with this email');return}
    const code=generateOTP(email)
    setGeneratedCode(code)
    setError('');setStep('otp')
  }

  const handleOTP=()=>{
    if(!otp||otp.length!==6){setError('Please enter the 6-digit code');return}
    if(!verifyOTP(email,otp)){setError('Incorrect code. Please try again.');return}
    setError('');setStep('reset')
  }

  const handleReset=()=>{
    if(newPass.length<6){setError('Password must be at least 6 characters');return}
    if(newPass!==confirmPass){setError('Passwords do not match');return}
    // Update password in mock DB
    const users=getUsers()
    const user=users.find(u=>u.email===email)
    if(user)(user as any).password=newPass
    setError('');setStep('done')
  }

  return(
    <Page>
      <NavBar title="Reset Password" left="back" onClose={()=>nav('/signup')}/>

      <div style={{padding:'24px 24px 0'}}>
        {/* Progress dots */}
        <div className="flex gap-2 mb-6 justify-center">
          {['email','otp','reset','done'].map((s,i)=>(
            <div key={s} style={{width:step===s?28:8,height:8,borderRadius:4,background:['email','otp','reset','done'].indexOf(step)>=i?'#C9A24D':'rgba(201,162,77,.15)',transition:'all .3s'}}/>
          ))}
        </div>

        {step==='email'&&<>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4" style={{width:64,height:64,borderRadius:32,background:'#FDF8ED'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A24D" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
            </div>
            <h2 className="text-[22px] font-bold mb-1">Enter your email</h2>
            <p className="text-[15px]" style={{color:'#8E8E93',lineHeight:'22px'}}>We'll send a verification code to reset your password</p>
          </div>
          {error&&<div className="mb-3" style={{padding:'10px 14px',borderRadius:10,background:'#FFF0EF'}}><p className="text-[13px] font-medium" style={{color:'#C94A4A'}}>{error}</p></div>}
          <div className="bg-white overflow-hidden mb-4" style={{borderRadius:14,border:'.5px solid #D1D1D6'}}>
            <div style={{padding:'14px 16px'}}>
              <label className="block text-[12px] mb-1" style={{color:'#AEAEB2'}}>Email address</label>
              <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('')}} placeholder="you@example.com" className="text-[17px] w-full outline-none bg-transparent placeholder-[#C7C7CC]"/>
            </div>
          </div>
          <button onClick={handleEmail} className="w-full press-scale flex items-center justify-center" style={{height:52,borderRadius:14,background:'linear-gradient(135deg,#C9A24D,#E6B65C)',border:'none'}}>
            <span className="text-[17px] font-semibold text-white">Send Code</span>
          </button>
        </>}

        {step==='otp'&&<>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4" style={{width:64,height:64,borderRadius:32,background:'#E8F9ED'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3E7C59" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2 className="text-[22px] font-bold mb-1">Verify code</h2>
            <p className="text-[15px]" style={{color:'#8E8E93',lineHeight:'22px'}}>Enter the 6-digit code sent to<br/><span className="font-semibold" style={{color:'#0F0F0C'}}>{email}</span></p>
          </div>
          {/* Show mock code for demo */}
          <div className="mb-4" style={{padding:'10px 14px',borderRadius:10,background:'#FDF8ED',border:'1px solid rgba(201,162,77,.15)'}}>
            <p className="text-[12px] font-semibold" style={{color:'#C9A24D'}}>Demo: Your code is <span className="font-mono text-[14px]">{generatedCode}</span></p>
          </div>
          {error&&<div className="mb-3" style={{padding:'10px 14px',borderRadius:10,background:'#FFF0EF'}}><p className="text-[13px] font-medium" style={{color:'#C94A4A'}}>{error}</p></div>}
          <div className="bg-white overflow-hidden mb-4" style={{borderRadius:14,border:'.5px solid #D1D1D6'}}>
            <div style={{padding:'14px 16px'}}>
              <label className="block text-[12px] mb-1" style={{color:'#AEAEB2'}}>6-digit code</label>
              <input value={otp} onChange={e=>{setOtp(e.target.value.replace(/\D/g,'').slice(0,6));setError('')}} placeholder="000000" className="text-[24px] font-mono w-full outline-none bg-transparent placeholder-[#C7C7CC] tracking-[8px] text-center"/>
            </div>
          </div>
          <button onClick={handleOTP} className="w-full press-scale flex items-center justify-center" style={{height:52,borderRadius:14,background:'linear-gradient(135deg,#C9A24D,#E6B65C)',border:'none'}}>
            <span className="text-[17px] font-semibold text-white">Verify</span>
          </button>
          <button onClick={()=>{const c=generateOTP(email);setGeneratedCode(c)}} className="w-full text-center mt-3"><span className="text-[14px]" style={{color:'#007AFF'}}>Resend code</span></button>
        </>}

        {step==='reset'&&<>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4" style={{width:64,height:64,borderRadius:32,background:'#FDF8ED'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A24D" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <h2 className="text-[22px] font-bold mb-1">New password</h2>
            <p className="text-[15px]" style={{color:'#8E8E93'}}>Choose a strong password</p>
          </div>
          {error&&<div className="mb-3" style={{padding:'10px 14px',borderRadius:10,background:'#FFF0EF'}}><p className="text-[13px] font-medium" style={{color:'#C94A4A'}}>{error}</p></div>}
          <div className="bg-white overflow-hidden mb-4" style={{borderRadius:14,border:'.5px solid #D1D1D6'}}>
            <div style={{padding:'14px 16px',borderBottom:'.33px solid rgba(60,60,67,.12)'}}>
              <label className="block text-[12px] mb-1" style={{color:'#AEAEB2'}}>New password</label>
              <input type="password" value={newPass} onChange={e=>{setNewPass(e.target.value);setError('')}} placeholder="Min 6 characters" className="text-[17px] w-full outline-none bg-transparent placeholder-[#C7C7CC]"/>
            </div>
            <div style={{padding:'14px 16px'}}>
              <label className="block text-[12px] mb-1" style={{color:'#AEAEB2'}}>Confirm password</label>
              <input type="password" value={confirmPass} onChange={e=>{setConfirmPass(e.target.value);setError('')}} placeholder="Re-enter password" className="text-[17px] w-full outline-none bg-transparent placeholder-[#C7C7CC]"/>
            </div>
          </div>
          <button onClick={handleReset} className="w-full press-scale flex items-center justify-center" style={{height:52,borderRadius:14,background:'linear-gradient(135deg,#C9A24D,#E6B65C)',border:'none'}}>
            <span className="text-[17px] font-semibold text-white">Reset Password</span>
          </button>
        </>}

        {step==='done'&&<>
          <div className="text-center" style={{paddingTop:40}}>
            <div className="inline-flex items-center justify-center mb-5" style={{width:80,height:80,borderRadius:40,background:'#E8F9ED'}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#3E7C59"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h2 className="text-[22px] font-bold mb-2">Password reset!</h2>
            <p className="text-[15px] mb-8" style={{color:'#8E8E93'}}>You can now sign in with your new password</p>
            <button onClick={()=>nav('/signup')} className="w-full press-scale flex items-center justify-center" style={{height:52,borderRadius:14,background:'linear-gradient(135deg,#C9A24D,#E6B65C)',border:'none'}}>
              <span className="text-[17px] font-semibold text-white">Back to Sign In</span>
            </button>
          </div>
        </>}
      </div>
    </Page>
  )
}
