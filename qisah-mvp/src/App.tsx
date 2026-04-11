import{Routes,Route,useLocation}from'react-router-dom'
import{AnimatePresence}from'framer-motion'
import{AppProvider}from'./hooks/useAppState'
import{ShareSheet,ToastBar}from'./components/overlays/ShareSheet'
import Splash from'./components/screens/SplashScreen'
import Onboarding from'./components/screens/OnboardingScreen'
import Madhab from'./components/screens/MadhabScreen'
import SignUp from'./components/screens/SignUpScreen'
import ForgotPw from'./components/screens/ForgotPasswordScreen'
import Profile from'./components/screens/ProfileScreen'
import Home from'./components/screens/HomeScreen'
import Scan from'./components/screens/ScanScreen'
import PasteLink from'./components/screens/PasteLinkScreen'
import Result from'./components/screens/ResultScreen'
import Chain from'./components/screens/ChainScreen'
import Scholar from'./components/screens/ScholarScreen'
import Library from'./components/screens/LibraryScreen'
import Saved from'./components/screens/SavedScreen'
import Settings from'./components/screens/SettingsScreen'
import Paywall from'./components/screens/PaywallScreen'
import ErrorScr from'./components/screens/ErrorScreen'
import Admin from'./components/screens/AdminScreen'
import TafsirScr from'./components/screens/TafsirScreen'

export default function App(){
  const loc=useLocation()
  return <AppProvider><div className="phone-frame">
    <AnimatePresence mode="wait">
      <Routes location={loc} key={loc.pathname}>
        <Route path="/" element={<Splash/>}/>
        <Route path="/onboarding" element={<Onboarding/>}/>
        <Route path="/madhab" element={<Madhab/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/forgot-password" element={<ForgotPw/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/scan" element={<Scan/>}/>
        <Route path="/paste-link" element={<PasteLink/>}/>
        <Route path="/result/:grade" element={<Result/>}/>
        <Route path="/chain/:grade" element={<Chain/>}/>
        <Route path="/scholar/:id" element={<Scholar/>}/>
        <Route path="/library" element={<Library/>}/>
        <Route path="/saved" element={<Saved/>}/>
        <Route path="/settings" element={<Settings/>}/>
        <Route path="/paywall" element={<Paywall/>}/>
        <Route path="/error" element={<ErrorScr/>}/>
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/tafsir/:verseId" element={<TafsirScr/>}/>
      </Routes>
    </AnimatePresence>
    <ShareSheet/><ToastBar/>
  </div></AppProvider>
}
