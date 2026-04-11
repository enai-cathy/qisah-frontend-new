import{createContext,useContext,useState,useEffect,ReactNode}from'react'
import type{Grade}from'../data/mock'
import type{User}from'../data/database'

export interface SavedItem{id:string;grade:Grade;title:string;source:string;savedAt:string}

interface AppState{
  isDark:boolean;toggleDark:()=>void
  notifications:boolean;toggleNotifications:()=>void
  madhab:string;setMadhab:(m:string)=>void
  isPro:boolean;setPro:(p:boolean)=>void
  currentUser:User|null;setCurrentUser:(u:User|null)=>void
  saved:SavedItem[];addSave:(i:SavedItem)=>void;removeSave:(id:string)=>void;isSaved:(id:string)=>boolean
  showShare:boolean;setShowShare:(s:boolean)=>void
  shareData:{title:string;text:string}|null;triggerShare:(t:string,x:string)=>void
  toast:string;showToast:(m:string)=>void
  otpStore:{email:string;code:string}|null;generateOTP:(email:string)=>string;verifyOTP:(email:string,code:string)=>boolean
}

const Ctx=createContext<AppState>({} as AppState)
export const useApp=()=>useContext(Ctx)

export function AppProvider({children}:{children:ReactNode}){
  const[isDark,setDark]=useState(false)
  const[notifications,setNotif]=useState(true)
  const[madhab,setMadhab]=useState('shafii')
  const[isPro,setPro]=useState(false)
  const[currentUser,setCurrentUser]=useState<User|null>(null)
  const[saved,setSaved]=useState<SavedItem[]>([])
  const[showShare,setShowShare]=useState(false)
  const[shareData,setShareData]=useState<{title:string;text:string}|null>(null)
  const[toast,setToast]=useState('')
  const[otpStore,setOtpStore]=useState<{email:string;code:string}|null>(null)

  useEffect(()=>{
    document.documentElement.classList.toggle('dark-mode',isDark)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',isDark?'#1A1A17':'#F7F3ED')
  },[isDark])

  const toggleDark=()=>setDark(d=>!d)
  const toggleNotifications=()=>setNotif(n=>!n)
  const addSave=(item:SavedItem)=>setSaved(s=>[item,...s.filter(x=>x.id!==item.id)])
  const removeSave=(id:string)=>setSaved(s=>s.filter(x=>x.id!==id))
  const isSaved=(id:string)=>saved.some(x=>x.id===id)
  const triggerShare=(title:string,text:string)=>{setShareData({title,text});setShowShare(true)}
  const showToast=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),2200)}

  // OTP system — mock logic, backend-ready
  const generateOTP=(email:string):string=>{
    const code=String(Math.floor(100000+Math.random()*900000))
    setOtpStore({email,code})
    console.log(`[MOCK OTP] Code for ${email}: ${code}`) // Backend replaces with real email
    return code
  }
  const verifyOTP=(email:string,code:string):boolean=>{
    if(!otpStore) return false
    return otpStore.email===email && otpStore.code===code
  }

  return <Ctx.Provider value={{isDark,toggleDark,notifications,toggleNotifications,madhab,setMadhab,isPro,setPro,saved,addSave,removeSave,isSaved,currentUser,setCurrentUser,showShare,setShowShare,shareData,triggerShare,toast,showToast,otpStore,generateOTP,verifyOTP}}>{children}</Ctx.Provider>
}
