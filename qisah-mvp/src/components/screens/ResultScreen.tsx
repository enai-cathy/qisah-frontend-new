import { useCallback, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { gradeConfigs, type Grade } from '../../data/mock';
import {
  getHadithByGrade,
  getLecturesByContent,
  getScholarsByHadith,
  getTafsirByVerse,
  quranVerses,
  scholars as allScholars,
} from '../../data/database';
import {
  Badge,
  CautionBanner,
  HeroCard,
  LectureCard,
  NavBar,
  Page,
  SectionHead,
  SegControl,
} from '../ui';
import { useApp } from '../../hooks/useAppState';

type LocationState = { verificationId?: string } | null;

export default function ResultScreen() {
  const { grade = 'sahih' } = useParams<{ grade: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerShare, addSave, removeSave, isSaved, setToast, getVerification, latestVerification } =
    useApp();

  const [segment, setSegment] = useState(0);
  const refs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const state = (location.state as LocationState) ?? null;
  const liveResult =
    (state?.verificationId ? getVerification(state.verificationId) : undefined) ??
    (latestVerification?.grade === grade ? latestVerification : undefined);

  const activeGrade = (liveResult?.grade ?? grade) as Grade;
  const config = gradeConfigs[activeGrade] || gradeConfigs.sahih;
  const fallbackHadith = getHadithByGrade(activeGrade as 'sahih' | 'hasan' | 'daif' | 'mukhtalaf');
  const fallbackLectures = getLecturesByContent(fallbackHadith?.id || 'h1');
  const fallbackScholars = getScholarsByHadith(fallbackHadith?.id || 'h1');
  const fallbackVerse = quranVerses[0];

  const isDaif = activeGrade === 'daif';
  const isNoSource = activeGrade === 'no_source';
  const isQuran = activeGrade === 'quran';
  const isMukhtalaf = activeGrade === 'mukhtalaf';
  const isHasan = activeGrade === 'hasan';

  const displayArabic =
    liveResult?.analyzed_statement.arabic_text ||
    (isQuran ? fallbackVerse.arabic_text : fallbackHadith?.arabic_text || '');
  const displayEnglish =
    liveResult?.analyzed_statement.english_text ||
    (isNoSource
      ? '"Love your children dearly, for they will be light..."'
      : isQuran
        ? '"Verily, with hardship comes ease."'
        : fallbackHadith?.english_text || '');
  const displaySource =
    liveResult?.analyzed_statement.source ||
    (isQuran ? 'The Holy Quran, Surah Ash-Sharh, Verses 5-6' : fallbackHadith?.source || '');

  const liveLectures = liveResult?.related_lectures.map((lecture) => ({
    title: lecture.title,
    speaker: lecture.speaker,
    duration: secondsToDuration(lecture.duration_seconds),
    gradient_from: 'rgba(201,162,77,.18)',
    gradient_to: 'rgba(62,124,89,.08)',
  }));
  const displayLectures = liveLectures?.length ? liveLectures : fallbackLectures;
  const displayScholars = liveResult?.scholars.length ? liveResult.scholars : fallbackScholars;

  const heroLabel = isDaif
    ? 'Weak Chain'
    : isMukhtalaf
      ? 'Scholars Disagree'
      : isNoSource
        ? 'Not Found'
        : isQuran
          ? 'Authentic Revelation'
          : isHasan
            ? 'Good Chain'
            : 'Authentic Chain';

  const checkIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={config.secondaryColor}>
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  const warnIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={config.secondaryColor} strokeWidth="2">
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );

  const activeId = liveResult?.id ?? `${activeGrade}-result`;
  const saved = isSaved(activeId);

  const handleSegment = useCallback(
    (index: number) => {
      setSegment(index);
      refs[index]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [refs],
  );

  const handleSave = () => {
    if (saved) {
      removeSave(activeId);
      setToast('Removed from saved');
      return;
    }

    addSave({
      id: activeId,
      verificationId: liveResult?.id,
      grade: activeGrade,
      title: displayEnglish.replace(/^["']|["']$/g, '').slice(0, 40) + '…',
      source: displaySource,
      savedAt: 'Just now',
    });
    setToast('Saved to library');
  };

  const handleShare = () => {
    triggerShare(
      `${config.label} — Verified by Qisah`,
      `${displayEnglish}\n\nSource: ${displaySource}\nGrade: ${config.label}\n\nVerified by Qisah — qisah.app`,
    );
  };

  const primaryBg = isDaif || isNoSource ? '#0F0F0C' : isMukhtalaf ? '#7B68A8' : isQuran ? '#1B6B3A' : 'linear-gradient(135deg,#C9A24D,#E6B65C)';
  const primaryLabel = isNoSource ? 'Report Correction' : isQuran ? 'View Tafsir' : 'View Chain';
  const primaryAction = () => {
    if (isQuran) {
      navigate('/tafsir/q1');
      return;
    }
    if (isNoSource) {
      navigate('/home');
      return;
    }
    navigate(`/chain/${activeGrade}`, { state: { verificationId: liveResult?.id } });
  };

  const noteColor = isDaif || isNoSource ? '#C94A4A' : isQuran || activeGrade === 'sahih' ? '#3E7C59' : '#CC7A00';
  const noteBg = isDaif || isNoSource ? '#FFF0EF' : isQuran ? '#E8F9ED' : '#FFF8ED';
  const quranData = liveResult?.quran_data;
  const alternative = liveResult?.alternative;

  return (
    <Page bg={isNoSource ? '#EFECE7' : undefined}>
      <NavBar title="Context Result" left="close" onClose={() => navigate('/home')} />
      <div className="flex justify-center" style={{ padding: '8px 0 4px' }}>
        <Badge grade={activeGrade} size="lg" />
      </div>
      <HeroCard
        gradient={config.gradient}
        label={heroLabel}
        labelColor={config.secondaryColor}
        title={config.heroTitle}
        subtitle={config.heroSubtitle}
        icon={isDaif || isNoSource || isMukhtalaf ? warnIcon : checkIcon}
      />

      <div
        className="px-4 sticky top-[44px] z-10 blur-bar"
        style={{ padding: '8px 16px 10px', borderBottom: '.33px solid rgba(60,60,67,.1)' }}
      >
        <SegControl
          items={isQuran ? ['Verse', 'Tafsir', 'Context', 'Lectures'] : ['Grade', 'Scholars', 'Context', 'Lectures']}
          active={segment}
          onChange={handleSegment}
        />
      </div>

      <div ref={refs[0]} style={{ scrollMarginTop: 100 }}>
        {(isDaif || isNoSource) && (
          <CautionBanner
            title="⚠ Exercise caution"
            text={
              isDaif
                ? 'This narration has known chain weaknesses.'
                : 'No verifiable chain. Do not attribute this wording to the Prophet ﷺ.'
            }
          />
        )}

        <div className="mx-4 mt-3 bg-white overflow-hidden" style={{ borderRadius: 14 }}>
          <div className="flex">
            <div
              className="shrink-0"
              style={{ width: 4, background: isNoSource ? '#AEAEB2' : config.accentColor }}
            />
            <div style={{ padding: '16px 18px', flex: 1 }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: isNoSource ? '#AEAEB2' : config.accentColor }}>
                Analyzed Statement
              </p>
              {!isNoSource && displayArabic && (
                <p
                  className="font-arabic font-bold text-center"
                  style={{
                    fontSize: isQuran ? 26 : 22,
                    lineHeight: isQuran ? '56px' : '48px',
                    color: '#2A2A24',
                  }}
                >
                  {displayArabic}
                </p>
              )}
              <div style={{ height: '.33px', background: 'rgba(60,60,67,.12)', margin: '12px 0' }} />
              <p className="font-serif italic" style={{ fontSize: 16, lineHeight: 1.55 }}>
                {displayEnglish}
              </p>
              {displaySource && (
                <p className="text-[13px] mt-3" style={{ color: '#636366' }}>
                  📖 {displaySource}
                </p>
              )}
            </div>
          </div>
        </div>

        {!isQuran && !isNoSource && (
          <>
            <SectionHead title="Grading Breakdown" color={config.accentColor} />
            <div className="flex gap-2.5 px-4">
              <div className="flex-1 bg-white" style={{ borderRadius: 14, padding: '14px 16px' }}>
                <p className="text-[10px] font-bold uppercase mb-2" style={{ color: '#8E8E93' }}>
                  🔗 Chain (Isnad)
                </p>
                <p
                  className="text-[16px] font-bold"
                  style={{ color: isDaif ? '#C94A4A' : isHasan ? '#C9A24D' : isMukhtalaf ? '#7B68A8' : '#3E7C59' }}
                >
                  {liveResult?.grading.chain.label ?? fallbackHadith?.chain_strength}
                </p>
                <p className="text-[12px] mt-1" style={{ color: '#636366', lineHeight: '17px' }}>
                  {(liveResult?.grading.chain.description ?? fallbackHadith?.chain_description ?? '').slice(0, 88)}
                </p>
              </div>
              <div className="flex-1 bg-white" style={{ borderRadius: 14, padding: '14px 16px' }}>
                <p className="text-[10px] font-bold uppercase mb-2" style={{ color: '#8E8E93' }}>
                  📝 Text (Matn)
                </p>
                <p className="text-[16px] font-bold" style={{ color: '#3E7C59' }}>
                  {liveResult?.grading.text.label ?? fallbackHadith?.text_strength}
                </p>
                <p className="text-[12px] mt-1" style={{ color: '#636366', lineHeight: '17px' }}>
                  {(liveResult?.grading.text.description ?? fallbackHadith?.text_description ?? '').slice(0, 88)}
                </p>
              </div>
            </div>
          </>
        )}

        {isQuran && (
          <>
            <SectionHead title="Surah Information" color="#3E7C59" />
            <div className="flex gap-2.5 px-4">
              <div className="flex-1 bg-white" style={{ borderRadius: 14, padding: '14px 16px' }}>
                <p className="text-[10px] font-bold uppercase mb-2" style={{ color: '#8E8E93' }}>
                  📖 Surah
                </p>
                <p className="text-[16px] font-bold" style={{ color: '#3E7C59' }}>
                  {quranData?.surah_name ?? fallbackVerse.surah_name}
                </p>
                <p className="text-[12px] mt-1" style={{ color: '#636366' }}>
                  #{quranData?.surah_number ?? fallbackVerse.surah_number} · {quranData?.verse_range ?? fallbackVerse.verse_range}
                </p>
              </div>
              <div className="flex-1 bg-white" style={{ borderRadius: 14, padding: '14px 16px' }}>
                <p className="text-[10px] font-bold uppercase mb-2" style={{ color: '#8E8E93' }}>
                  🕌 Revelation
                </p>
                <p className="text-[16px] font-bold" style={{ color: '#3E7C59' }}>
                  {(quranData?.revelation ?? fallbackVerse.revelation).replace(/^./, (value) => value.toUpperCase())}
                </p>
                <p className="text-[12px] mt-1" style={{ color: '#636366' }}>
                  {quranData?.total_verses ?? fallbackVerse.total_verses} verses · Juz {quranData?.juz ?? fallbackVerse.juz}
                </p>
              </div>
            </div>
          </>
        )}

        {isNoSource && (
          <>
            <SectionHead title="Authentic Alternative" color="#3E7C59" />
            <div className="px-4">
              <div style={{ borderRadius: 14, padding: '16px 18px', background: '#E8F9ED' }}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#3E7C59' }}>
                  💚 Verified hadith on same topic
                </p>
                <p className="font-arabic text-[18px] font-bold text-center" style={{ lineHeight: '40px', color: '#2A2A24' }}>
                  {alternative?.arabic_text ?? 'مَنْ لَمْ يَرْحَمْ صَغِيرَنَا فَلَيْسَ مِنَّا'}
                </p>
                <div style={{ height: '.33px', background: 'rgba(62,124,89,.15)', margin: '8px 0' }} />
                <p className="font-serif text-[15px] italic" style={{ lineHeight: 1.55 }}>
                  "{alternative?.english_text ?? 'Whoever does not show mercy to our young ones is not one of us.'}"
                </p>
                <p className="text-[13px] mt-2" style={{ color: '#636366' }}>
                  📖 {alternative?.source ?? 'Abu Dawud'} · <span className="font-semibold text-[#3E7C59]">{alternative?.grade ?? 'sahih'}</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div ref={refs[1]} style={{ scrollMarginTop: 100 }}>
        {!isNoSource && !isQuran && (
          <>
            <SectionHead title={isMukhtalaf ? 'Scholarly Spectrum' : 'Scholarly Opinions'} color={config.accentColor} />
            <div className="px-4">
              {!isMukhtalaf && (
                <div
                  className="flex items-center gap-2 mb-2.5"
                  style={{ borderRadius: 12, padding: '12px 16px', background: config.accentBg }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={config.accentColor}>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[14px] font-semibold" style={{ color: config.accentColor }}>
                    {isDaif ? 'Majority grade as Daif' : isHasan ? 'Majority grade: Hasan' : 'All major schools agree: Sahih'}
                  </span>
                </div>
              )}

              {isMukhtalaf && (
                <div className="bg-white mb-3" style={{ borderRadius: 14, padding: 16 }}>
                  <div className="mb-2" style={{ height: 6, borderRadius: 3, background: 'linear-gradient(90deg,#3E7C59 28%,#C9A24D 50%,#C94A4A 72%)' }} />
                  <div className="flex justify-between">
                    <span className="text-[12px] font-semibold" style={{ color: '#3E7C59' }}>Sahih</span>
                    <span className="text-[12px] font-semibold" style={{ color: '#C9A24D' }}>Hasan</span>
                    <span className="text-[12px] font-semibold" style={{ color: '#C94A4A' }}>Da'if</span>
                  </div>
                </div>
              )}

              {displayScholars.slice(0, 4).map((scholar, index) => {
                const scholarName = 'name' in scholar ? scholar.name : scholar.name;
                const scholarWork = 'work' in scholar ? scholar.work : scholar.work;
                const scholarSchool = 'school' in scholar ? scholar.school : scholar.school;
                const scholarGrading = 'grading' in scholar ? scholar.grading : config.label;
                const scholarId =
                  'id' in scholar && allScholars.some((entry) => entry.id === scholar.id)
                    ? scholar.id
                    : allScholars.find((entry) => entry.name === scholarName)?.id;
                const scholarInitial =
                  allScholars.find((entry) => entry.name === scholarName)?.initial || scholarName[0];
                const scholarColor =
                  allScholars.find((entry) => entry.name === scholarName)?.color || config.accentColor;
                const scholarBg =
                  allScholars.find((entry) => entry.name === scholarName)?.bg_color || config.accentBg;

                return (
                  <button
                    key={`${scholarName}-${index}`}
                    onClick={() => scholarId && navigate(`/scholar/${scholarId}`)}
                    className="bg-white flex items-center gap-3 mb-1.5 w-full text-left press-scale"
                    style={{
                      borderRadius: 12,
                      padding: '12px 16px',
                      border: index === 0 ? '1px solid #E6B65C' : undefined,
                    }}
                  >
                    <div
                      className="shrink-0 flex items-center justify-center text-[12px] font-bold"
                      style={{ width: 32, height: 32, borderRadius: 16, background: scholarBg, color: scholarColor }}
                    >
                      {scholarInitial}
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-medium">{scholarName}</p>
                      {index === 0 && (
                        <p className="text-[11px] mt-0.5" style={{ color: '#8E8E93' }}>
                          {scholarWork} · <span className="font-semibold" style={{ color: config.accentColor }}>{scholarGrading}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase" style={{ color: '#8E8E93' }}>
                      {String(scholarSchool)}
                    </span>
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                      <path d="M1 1l5 5-5 5" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {isQuran && (
          <>
            <SectionHead title="Tafsir Sources" color="#3E7C59" />
            <div className="px-4">
              <div className="bg-white overflow-hidden" style={{ borderRadius: 14 }}>
                {getTafsirByVerse('q1').map((tafsir, index, array) => (
                  <button
                    key={tafsir.id}
                    onClick={() => navigate('/tafsir/q1')}
                    className="flex items-center gap-3 w-full text-left press-scale"
                    style={{
                      padding: '12px 16px',
                      borderBottom: index < array.length - 1 ? '.33px solid rgba(60,60,67,.12)' : 'none',
                    }}
                  >
                    <div
                      className="shrink-0 flex items-center justify-center text-[11px] font-bold"
                      style={{ width: 32, height: 32, borderRadius: 16, background: tafsir.bg, color: tafsir.color }}
                    >
                      {tafsir.initial}
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-medium">{tafsir.source}</p>
                      <p className="text-[12px]" style={{ color: '#8E8E93' }}>{tafsir.type}</p>
                    </div>
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                      <path d="M1 1l5 5-5 5" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div ref={refs[2]} style={{ scrollMarginTop: 100 }}>
        <SectionHead title={isNoSource ? 'Why This Matters' : isQuran ? 'Reason for Revelation' : 'Context & Interpretation'} color={isNoSource ? '#C94A4A' : config.accentColor} />
        <div className="px-4">
          <div className="bg-white" style={{ borderRadius: 14, padding: 18 }}>
            <p className="text-[15px]" style={{ color: '#2A2A24', lineHeight: 1.6 }}>
              {liveResult?.context.interpretation ??
                fallbackHadith?.context ??
                fallbackVerse.reason_for_revelation}
            </p>
            <div
              className="mt-3.5"
              style={{
                borderRadius: 12,
                padding: '14px 16px',
                borderLeft: `3px solid ${noteColor}`,
                background: noteBg,
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: noteColor }}>
                {liveResult?.context.note_title ?? fallbackHadith?.note_title ?? 'Key insight'}
              </p>
              <p className="text-[13px]" style={{ color: '#2A2A24', lineHeight: '20px' }}>
                {liveResult?.context.note_text ?? fallbackHadith?.note_text ?? fallbackVerse.reason_for_revelation}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div ref={refs[3]} style={{ scrollMarginTop: 100 }}>
        <SectionHead title="Related Lectures" />
        <div className="flex gap-2.5 px-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {displayLectures.map((lecture) => (
            <LectureCard key={`${lecture.title}-${lecture.speaker}`} l={lecture} />
          ))}
        </div>
      </div>

      <div className="text-center mt-4 mb-2">
        <span className="text-[13px]" style={{ color: '#8E8E93' }}>
          Found an error? <button className="font-medium" style={{ color: '#C94A4A' }}>Report a correction</button>
        </span>
      </div>

      <div
        className="flex items-center gap-2.5 sticky bottom-0 z-10 blur-bar"
        style={{ padding: '12px 16px 28px', borderTop: '.33px solid rgba(60,60,67,.1)' }}
      >
        <button
          onClick={handleShare}
          className="press-scale shrink-0 flex items-center justify-center"
          style={{ width: 48, height: 48, borderRadius: 24, background: '#fff', border: '1px solid #E5E5EA' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
        <button
          onClick={handleSave}
          className="press-scale shrink-0 flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            background: saved ? '#FDF8ED' : '#fff',
            border: `1px solid ${saved ? '#C9A24D' : '#E5E5EA'}`,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? '#C9A24D' : 'none'} stroke={saved ? '#C9A24D' : '#636366'} strokeWidth="1.8">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
        </button>
        <button
          onClick={primaryAction}
          className="press-scale flex-1 flex items-center justify-center gap-2"
          style={{ height: 48, borderRadius: 14, background: primaryBg, border: 'none' }}
        >
          <span className="text-[16px] font-semibold text-white">{primaryLabel}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </Page>
  );
}

function secondsToDuration(value: number): string {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
