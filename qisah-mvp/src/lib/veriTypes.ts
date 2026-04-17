export type VerificationGrade =
  | 'sahih'
  | 'hasan'
  | 'daif'
  | 'mukhtalaf'
  | 'quran'
  | 'no_source';

export type VerificationInputType = 'audio' | 'url' | 'text';

export interface VerifyAudioRequest {
  type: 'audio';
  audio_base64: string;
  format?: string;
  duration_seconds?: number;
  language_hint?: string;
  user_madhab?: string;
}

export interface VerifyUrlRequest {
  type: 'url';
  url: string;
  user_madhab?: string;
}

export interface VerifyTextRequest {
  type: 'text';
  text: string;
  user_madhab?: string;
}

export type VerifyRequest = VerifyAudioRequest | VerifyUrlRequest | VerifyTextRequest;

export interface VerificationStatement {
  arabic_text: string;
  english_text: string;
  source: string;
  source_url: string;
}

export interface VerificationGradingNode {
  status: string;
  label: string;
  description: string;
}

export interface VerificationScholar {
  id: string;
  name: string;
  arabic_name: string;
  school: string;
  grading: string;
  work: string;
  commentary: string;
  is_preferred: boolean;
}

export interface VerificationChainNarrator {
  name: string;
  arabic_name: string;
  reliability: string;
  era: string;
  position: number;
}

export interface VerificationContext {
  interpretation: string;
  note_type: string;
  note_title: string;
  note_text: string;
}

export interface QuranTafsirSource {
  id: string;
  name: string;
  type: string;
}

export interface QuranRelatedVerse {
  reference: string;
  text: string;
}

export interface QuranData {
  surah_number: number;
  surah_name: string;
  surah_arabic: string;
  verse_range: string;
  revelation: 'makkan' | 'madinan';
  total_verses: number;
  juz: number;
  reason_for_revelation: string;
  tafsir_sources: QuranTafsirSource[];
  related_verses: QuranRelatedVerse[];
}

export interface AlternativeResult {
  arabic_text: string;
  english_text: string;
  source: string;
  grade: Exclude<VerificationGrade, 'quran' | 'no_source'>;
}

export interface RelatedLecture {
  id: string;
  title: string;
  speaker: string;
  duration_seconds: number;
  thumbnail_url: string;
  source_url: string;
}

export interface VerificationMetadata {
  processing_time_ms: number;
  sources_checked: number;
  model_version: string;
}

export interface VerificationSuccess {
  id: string;
  status: 'completed';
  grade: VerificationGrade;
  confidence: number;
  analyzed_statement: VerificationStatement;
  grading: {
    chain: VerificationGradingNode;
    text: VerificationGradingNode;
  };
  scholars: VerificationScholar[];
  chain: VerificationChainNarrator[];
  context: VerificationContext;
  quran_data: QuranData | null;
  alternative: AlternativeResult | null;
  related_lectures: RelatedLecture[];
  metadata: VerificationMetadata;
}

export interface VerificationError {
  error: string;
  message?: string;
  remaining_today?: number;
  resets_at?: string;
  feature?: string;
}

export interface VerificationEngineContext {
  authToken?: string;
  now?: Date;
  bypassRateLimit?: boolean;
  openAiApiKey?: string;
  openAiBaseUrl?: string;
  fetchImpl?: typeof fetch;
  allowFallback?: boolean;
}
