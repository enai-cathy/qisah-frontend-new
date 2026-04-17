import { motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { gradeConfigs, type Grade } from '../../data/mock';
import { getChainByHadith } from '../../data/database';
import { HeroCard, NavBar, Page, SectionHead } from '../ui';
import { useApp } from '../../hooks/useAppState';

type LocationState = { verificationId?: string } | null;

export default function ChainScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { grade = 'sahih' } = useParams();
  const { getVerification, latestVerification } = useApp();

  const state = (location.state as LocationState) ?? null;
  const liveResult =
    (state?.verificationId ? getVerification(state.verificationId) : undefined) ??
    (latestVerification?.grade === grade ? latestVerification : undefined);

  const config = gradeConfigs[(liveResult?.grade ?? grade) as Grade] || gradeConfigs.sahih;
  const chain = liveResult?.chain.length ? liveResult.chain : getChainByHadith('h1');

  const reliabilityColors: Record<string, { color: string; background: string }> = {
    infallible: { color: '#C9A24D', background: 'rgba(201,162,77,.12)' },
    trustworthy: { color: '#3E7C59', background: '#E8F9ED' },
    reliable: { color: '#2B6CB8', background: 'rgba(59,125,216,.08)' },
    weak: { color: '#C94A4A', background: '#FFF0EF' },
    unknown: { color: '#8E8E93', background: '#F2F2F7' },
  };

  return (
    <Page>
      <NavBar title="Transmission Chain" onClose={() => navigate(-1)} />
      <HeroCard
        gradient={config.gradient}
        label="Chain of Narration"
        labelColor={config.secondaryColor}
        title={`${chain.length} Narrators`}
        subtitle="Complete chain from the reported source back through the transmission line"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill={config.secondaryColor}>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <div className="flex gap-2 px-4 mt-3">
        {[
          ['Continuity', liveResult?.grading.chain.label ?? 'Connected', '#3E7C59'],
          ['Reliability', liveResult?.grading.chain.status ?? 'strong', '#3E7C59'],
          ['Consensus', liveResult?.grade === 'mukhtalaf' ? 'Disputed' : 'Agreed', liveResult?.grade === 'mukhtalaf' ? '#7B68A8' : '#3E7C59'],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="flex-1 bg-white text-center" style={{ borderRadius: 12, padding: '12px 8px' }}>
            <p className="text-[10px] font-bold uppercase" style={{ color: '#8E8E93' }}>
              {label}
            </p>
            <p className="text-[14px] font-bold mt-1" style={{ color: String(color) }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <SectionHead title="Narrator Lineage" color={config.accentColor} />
      <div className="px-4 pb-8">
        {chain.map((narrator, index) => {
          const palette = reliabilityColors[narrator.reliability] ?? reliabilityColors.unknown;
          const avatarText = narrator.name[0] === 'P' ? 'ﷺ' : narrator.name[0];
          return (
            <div key={`${narrator.name}-${index}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white flex items-center gap-3 press-scale"
                style={{
                  borderRadius: 14,
                  padding: '14px 16px',
                  border: index === 0 ? '1.5px solid rgba(201,162,77,.3)' : '1px solid rgba(60,60,67,.04)',
                }}
              >
                <div
                  className="shrink-0 flex items-center justify-center text-[14px] font-bold"
                  style={{ width: 42, height: 42, borderRadius: 21, background: palette.background, color: palette.color }}
                >
                  {avatarText}
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold">{narrator.name}</p>
                  <p className="font-arabic text-[13px] mt-0.5" style={{ color: '#8E8E93' }}>
                    {narrator.arabic_name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: palette.background, color: palette.color }}>
                    {narrator.reliability}
                  </span>
                  <p className="text-[10px] mt-1" style={{ color: '#AEAEB2' }}>
                    {narrator.era}
                  </p>
                </div>
              </motion.div>
              {index < chain.length - 1 && (
                <div className="flex justify-center py-1">
                  <div style={{ width: 2, height: 20, borderRadius: 1, background: 'linear-gradient(180deg,rgba(201,162,77,.3),rgba(201,162,77,.1))' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
}
