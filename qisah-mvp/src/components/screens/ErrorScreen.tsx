import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar, Page } from '../ui';

type ErrorState = {
  title?: string;
  message?: string;
  retryPath?: string;
  secondaryPath?: string;
  secondaryLabel?: string;
};

export default function ErrorScreen() {
  const nav = useNavigate();
  const location = useLocation();
  const state = (location.state as ErrorState | null) ?? null;

  const title = state?.title ?? 'Audio too short';
  const message =
    state?.message ??
    'We need at least 10 seconds of audio to accurately identify and verify.';
  const retryPath = state?.retryPath ?? '/scan';
  const secondaryPath = state?.secondaryPath ?? '/verify-text';
  const secondaryLabel = state?.secondaryLabel ?? 'Enter Text Instead';

  return (
    <Page className="h-full flex flex-col">
      <NavBar title="Verification" left="close" onClose={() => nav('/home')} />
      <div
        className="flex-1 flex flex-col items-center justify-center text-center"
        style={{ padding: '0 40px' }}
      >
        <div
          className="flex items-center justify-center mb-5"
          style={{ width: 80, height: 80, borderRadius: 40, background: '#FFF8ED' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#CC7A00" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="font-serif text-[22px] font-bold mb-2">{title}</h1>
        <p className="text-[16px]" style={{ color: '#8E8E93', lineHeight: 1.55 }}>
          {message}
        </p>
        <div className="w-full mt-8">
          <button
            onClick={() => nav(retryPath)}
            className="w-full press-scale flex items-center justify-center mb-2.5"
            style={{
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg,#C9A24D,#E6B65C)',
              border: 'none',
            }}
          >
            <span className="text-[17px] font-semibold text-white">Try Again</span>
          </button>
          <button
            onClick={() => nav(secondaryPath)}
            className="w-full press-scale flex items-center justify-center"
            style={{ height: 52, borderRadius: 14, background: '#F2F2F7', border: 'none' }}
          >
            <span className="text-[17px] font-semibold">{secondaryLabel}</span>
          </button>
        </div>
      </div>
    </Page>
  );
}
