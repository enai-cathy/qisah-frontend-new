import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardGroup, Cell, NavBar, Page } from '../ui';
import { submitVerification } from '../../lib/veriClient';
import { VerifyApiError } from '../../lib/veriEngine';
import { useApp } from '../../hooks/useAppState';

export default function PasteLinkScreen() {
  const nav = useNavigate();
  const { currentUser, madhab, rememberVerification, showToast } = useApp();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (value = url) => {
    if (!value.trim()) {
      setError('Paste a video or audio URL first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await submitVerification(
        {
          type: 'url',
          url: value.trim(),
          user_madhab: madhab,
        },
        currentUser?.email ?? 'demo-qisah-user',
      );
      rememberVerification(result);
      showToast('Link verified');
      nav(`/result/${result.grade}`, { state: { verificationId: result.id } });
    } catch (caughtError) {
      const message =
        caughtError instanceof VerifyApiError
          ? caughtError.data.message ?? caughtError.data.error
          : 'Could not verify that link.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClipboardPaste = async () => {
    try {
      const pasted = await navigator.clipboard.readText();
      if (!pasted.trim()) {
        setError('Clipboard is empty.');
        return;
      }
      setUrl(pasted);
      setError('');
    } catch {
      setError('Clipboard access is unavailable in this browser.');
    }
  };

  return (
    <Page>
      <NavBar title="Verify a Link" />
      <div className="text-center" style={{ padding: '20px 32px 20px' }}>
        <div
          className="inline-flex items-center justify-center mb-3"
          style={{ width: 64, height: 64, borderRadius: 32, background: '#FDF8ED' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A24D" strokeWidth="2">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <h1 className="text-[22px] font-bold">Paste any video or audio link</h1>
        <p className="text-[14px] mt-1.5" style={{ color: '#636366', lineHeight: '20px' }}>
          Veri will inspect the link, extract what it can, and match the content against
          authenticated sources.
        </p>
      </div>

      <div className="px-4">
        <div
          className="flex items-center bg-white"
          style={{
            borderRadius: 14,
            border: '1.5px solid rgba(201,162,77,.2)',
            padding: '4px 4px 4px 14px',
            minHeight: 50,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C9A24D"
            strokeWidth="1.5"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
          <input
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setError('');
            }}
            placeholder="https://"
            className="flex-1 px-2 text-[15px] outline-none bg-transparent placeholder-[#C7C7CC]"
          />
          <button
            onClick={() => void handleVerify()}
            disabled={loading}
            className="press-scale shrink-0"
            style={{
              height: 42,
              padding: '0 18px',
              borderRadius: 10,
              background: 'linear-gradient(135deg,#C9A24D,#E6B65C)',
              border: 'none',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '...' : 'Verify'}
          </button>
        </div>

        {error && (
          <p className="text-[13px] mt-3" style={{ color: '#C94A4A' }}>
            {error}
          </p>
        )}

        <button
          onClick={() => void handleClipboardPaste()}
          className="mt-3 w-full flex items-center gap-3 press-scale text-left"
          style={{ padding: '12px 14px', background: '#FDF8ED', borderRadius: 12 }}
        >
          <span className="text-[22px]">📋</span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold">Paste from clipboard</p>
            <p className="text-[12px] truncate" style={{ color: '#8E8E93' }}>
              {url || 'Bring in the latest copied link'}
            </p>
          </div>
          <span className="text-[15px] font-bold" style={{ color: '#C9A24D' }}>
            Paste
          </span>
        </button>
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: '#8E8E93' }}>
          Popular Sources
        </p>
        <CardGroup>
          <Cell title="TikTok or Reels" subtitle="Short clips and snippets" icon="🎵" iconBg="#FFF8ED" onTap={() => setUrl('https://example.com/with-hardship-comes-ease')} />
          <Cell title="YouTube lectures" subtitle="Talks, khutbahs, and lessons" icon="▶️" iconBg="#FFEDEC" onTap={() => setUrl('https://example.com/actions-are-judged-by-intentions')} />
          <Cell title="Direct media URLs" subtitle="Audio and video file links" icon="🔊" iconBg="#E8F9ED" last onTap={() => setUrl('https://example.com/seek-knowledge-even-if-you-have-to-go-to-china')} />
        </CardGroup>
      </div>
    </Page>
  );
}
