import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Page } from '../ui';
import { submitVerification } from '../../lib/veriClient';
import { VerifyApiError } from '../../lib/veriEngine';
import { useApp } from '../../hooks/useAppState';

const samplePrompts = [
  'Actions are judged by intentions',
  'Verily, with hardship comes ease',
  'Seek knowledge even if you have to go to China',
];

export default function VerifyTextScreen() {
  const nav = useNavigate();
  const { currentUser, madhab, rememberVerification, showToast } = useApp();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Enter some text to verify.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await submitVerification(
        {
          type: 'text',
          text,
          user_madhab: madhab,
        },
        currentUser?.email ?? 'demo-qisah-user',
      );
      rememberVerification(result);
      showToast('Verification completed');
      nav(`/result/${result.grade}`, { state: { verificationId: result.id } });
    } catch (caughtError) {
      const message =
        caughtError instanceof VerifyApiError
          ? caughtError.data.message ?? caughtError.data.error
          : 'Could not verify that text right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <NavBar title="Enter Text" />
      <div className="px-4" style={{ paddingTop: 18, paddingBottom: 24 }}>
        <div
          className="mb-4"
          style={{
            borderRadius: 18,
            padding: '18px 18px 16px',
            background: 'linear-gradient(180deg,#FDF8ED,#FFF)',
            border: '1px solid rgba(201,162,77,.16)',
          }}
        >
          <p className="text-[22px] font-bold">Verify a quote directly</p>
          <p className="text-[14px] mt-1.5" style={{ color: '#636366', lineHeight: 1.55 }}>
            Paste Arabic, English, or mixed text and Veri will match it against the Quran and
            authenticated hadith references.
          </p>
        </div>

        <div
          className="bg-white"
          style={{
            borderRadius: 16,
            padding: 14,
            border: '1px solid rgba(60,60,67,.08)',
          }}
        >
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError('');
            }}
            placeholder="Type or paste the statement you want to verify..."
            className="w-full resize-none outline-none bg-transparent"
            style={{
              minHeight: 180,
              fontSize: 16,
              lineHeight: 1.6,
              color: '#0F0F0C',
            }}
          />
        </div>

        {error && (
          <p className="text-[14px] mt-3" style={{ color: '#C94A4A' }}>
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setText(prompt);
                setError('');
              }}
              className="press-scale text-left"
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                background: '#F2F2F7',
                color: '#2A2A24',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="press-scale w-full mt-5 flex items-center justify-center"
          style={{
            height: 52,
            borderRadius: 14,
            background: 'linear-gradient(135deg,#C9A24D,#E6B65C)',
            border: 'none',
            opacity: loading ? 0.7 : 1,
          }}
        >
          <span className="text-[17px] font-semibold text-white">
            {loading ? 'Verifying...' : 'Verify Text'}
          </span>
        </button>
      </div>
    </Page>
  );
}
