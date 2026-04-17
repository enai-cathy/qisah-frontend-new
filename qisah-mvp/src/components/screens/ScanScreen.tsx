import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CardGroup, Cell, NavBar, Page } from '../ui';
import { submitVerification } from '../../lib/veriClient';
import { VerifyApiError } from '../../lib/veriEngine';
import { useApp } from '../../hooks/useAppState';

const phases = ['Listening...', 'Detecting speech...', 'Matching sources...', 'Verifying...'];
const demoTranscript = 'فإن مع العسر يسرا إن مع العسر يسرا';

export default function ScanScreen() {
  const nav = useNavigate();
  const { currentUser, madhab, rememberVerification } = useApp();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [detectedText, setDetectedText] = useState('');

  useEffect(() => {
    const first = window.setTimeout(() => {
      setPhaseIndex(1);
      setDetectedText('"…with hardship comes ease, verily with hardship comes ease…"');
    }, 1200);
    const second = window.setTimeout(() => setPhaseIndex(2), 2500);
    const third = window.setTimeout(() => setPhaseIndex(3), 3800);
    const verify = window.setTimeout(async () => {
      try {
        const result = await submitVerification(
          {
            type: 'audio',
            audio_base64: encodeTextToBase64(demoTranscript),
            format: 'm4a',
            duration_seconds: 15,
            language_hint: 'ar',
            user_madhab: madhab,
          },
          currentUser?.email ?? 'demo-qisah-user',
        );
        rememberVerification(result);
        nav(`/result/${result.grade}`, { state: { verificationId: result.id } });
      } catch (error) {
        const apiError = error instanceof VerifyApiError ? error : null;
        const title =
          apiError?.data.error === 'audio_too_short' ? 'Audio too short' : 'Verification failed';
        const message =
          apiError?.data.message ?? 'We could not finish this verification right now.';
        nav('/error', {
          state: {
            title,
            message,
            retryPath: '/scan',
            secondaryPath: '/verify-text',
            secondaryLabel: 'Enter Text Instead',
          },
        });
      }
    }, 4800);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
      window.clearTimeout(third);
      window.clearTimeout(verify);
    };
  }, [currentUser?.email, madhab, nav, rememberVerification]);

  return (
    <Page>
      <NavBar title="Verification Assistant" left="close" onClose={() => nav('/home')} />
      <div className="flex justify-center" style={{ padding: '28px 0 12px' }}>
        <div className="relative" style={{ width: 140, height: 140 }}>
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full"
            style={{ border: '1.5px solid rgba(201,162,77,.15)' }}
          />
          <div
            className="absolute flex items-center justify-center"
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              left: 20,
              top: 20,
              background: 'linear-gradient(145deg,#D4AD4E,#E6C05C)',
              boxShadow: '0 6px 20px rgba(201,162,77,.3)',
            }}
          >
            <span className="text-[40px]">🎙️</span>
          </div>
        </div>
      </div>

      <div className="text-center px-8">
        <h2 className="text-[24px] font-bold">{phases[phaseIndex]}</h2>
        <p className="text-[15px] mt-1" style={{ color: '#8E8E93' }}>
          Capturing audio to verify context
        </p>
      </div>

      {detectedText && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-5 bg-white"
          style={{ borderRadius: 14, padding: '16px 18px' }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: '#C9A24D' }}
          >
            Detecting
          </p>
          <p className="font-serif text-[15px] italic" style={{ color: '#2A2A24', lineHeight: 1.6 }}>
            {detectedText}
          </p>
        </motion.div>
      )}

      <div className="flex gap-1.5 mx-4 mt-5">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex-1 rounded-full"
            style={{
              height: 4,
              background: index <= phaseIndex ? '#C9A24D' : 'rgba(201,162,77,.12)',
              transition: 'background .3s',
            }}
          />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <div
          className="flex items-center gap-1.5 px-4 py-2 rounded-full"
          style={{ background: '#E8F9ED' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#3E7C59">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[12px] font-semibold" style={{ color: '#145229' }}>
            Structured verification pipeline active
          </span>
        </div>
      </div>

      <div style={{ padding: '24px 16px 0' }}>
        <div className="flex items-center gap-2 mb-2">
          <div style={{ width: 3, height: 18, borderRadius: 1.5, background: '#C9A24D' }} />
          <h2 className="text-[18px] font-bold">Other Capture Options</h2>
        </div>
        <CardGroup>
          <Cell icon="🎬" iconBg="#FFEDEC" title="Record Video" subtitle="For clips and lectures" onTap={() => nav('/paste-link')} />
          <Cell icon="🖼️" iconBg="#FFF8ED" title="Upload from Gallery" subtitle="Select media files" onTap={() => nav('/paste-link')} />
          <Cell icon="✍️" iconBg="#FDF8ED" title="Enter Text Manually" subtitle="Type or paste to verify" last onTap={() => nav('/verify-text')} />
        </CardGroup>
      </div>
    </Page>
  );
}

function encodeTextToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return globalThis.btoa(binary);
}
