import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Grade } from '../data/mock';
import type { User } from '../data/database';
import type { VerificationSuccess } from '../lib/veriTypes';

export interface SavedItem {
  id: string;
  grade: Grade;
  title: string;
  source: string;
  savedAt: string;
  verificationId?: string;
}

interface AppState {
  isDark: boolean;
  toggleDark: () => void;
  notifications: boolean;
  toggleNotifications: () => void;
  madhab: string;
  setMadhab: (value: string) => void;
  isPro: boolean;
  setPro: (value: boolean) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  saved: SavedItem[];
  addSave: (item: SavedItem) => void;
  removeSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  showShare: boolean;
  setShowShare: (value: boolean) => void;
  shareData: { title: string; text: string } | null;
  triggerShare: (title: string, text: string) => void;
  toast: string;
  showToast: (message: string) => void;
  setToast: (message: string) => void;
  otpStore: { email: string; code: string } | null;
  generateOTP: (email: string) => string;
  verifyOTP: (email: string, code: string) => boolean;
  verificationHistory: VerificationSuccess[];
  latestVerification: VerificationSuccess | null;
  rememberVerification: (result: VerificationSuccess) => void;
  getVerification: (id: string) => VerificationSuccess | undefined;
}

const AppContext = createContext<AppState>({} as AppState);

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDark, setDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [madhab, setMadhab] = useState('shafii');
  const [isPro, setPro] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [showShare, setShowShare] = useState(false);
  const [shareData, setShareData] = useState<{ title: string; text: string } | null>(null);
  const [toast, setToastState] = useState('');
  const [otpStore, setOtpStore] = useState<{ email: string; code: string } | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<VerificationSuccess[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', isDark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#1A1A17' : '#F7F3ED');
  }, [isDark]);

  const latestVerification = verificationHistory[0] ?? null;

  const toggleDark = () => setDark((value) => !value);
  const toggleNotifications = () => setNotifications((value) => !value);

  const addSave = (item: SavedItem) => {
    setSaved((current) => [item, ...current.filter((entry) => entry.id !== item.id)]);
  };

  const removeSave = (id: string) => {
    setSaved((current) => current.filter((entry) => entry.id !== id));
  };

  const isSaved = (id: string) => saved.some((entry) => entry.id === id);

  const triggerShare = (title: string, text: string) => {
    setShareData({ title, text });
    setShowShare(true);
  };

  const showToast = (message: string) => {
    setToastState(message);
    window.setTimeout(() => setToastState(''), 2200);
  };

  const setToast = (message: string) => {
    setToastState(message);
    if (message) {
      window.setTimeout(() => setToastState(''), 2200);
    }
  };

  const generateOTP = (email: string): string => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpStore({ email, code });
    console.log(`[MOCK OTP] Code for ${email}: ${code}`);
    return code;
  };

  const verifyOTP = (email: string, code: string): boolean => {
    if (!otpStore) {
      return false;
    }
    return otpStore.email === email && otpStore.code === code;
  };

  const rememberVerification = (result: VerificationSuccess) => {
    setVerificationHistory((current) => [
      result,
      ...current.filter((entry) => entry.id !== result.id),
    ]);
  };

  const getVerification = (id: string) =>
    verificationHistory.find((entry) => entry.id === id);

  const value = useMemo<AppState>(
    () => ({
      isDark,
      toggleDark,
      notifications,
      toggleNotifications,
      madhab,
      setMadhab,
      isPro,
      setPro,
      currentUser,
      setCurrentUser,
      saved,
      addSave,
      removeSave,
      isSaved,
      showShare,
      setShowShare,
      shareData,
      triggerShare,
      toast,
      showToast,
      setToast,
      otpStore,
      generateOTP,
      verifyOTP,
      verificationHistory,
      latestVerification,
      rememberVerification,
      getVerification,
    }),
    [
      currentUser,
      isDark,
      isPro,
      latestVerification,
      madhab,
      notifications,
      otpStore,
      saved,
      shareData,
      showShare,
      toast,
      verificationHistory,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
