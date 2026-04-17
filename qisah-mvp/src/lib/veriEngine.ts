import {
  chainNarrators,
  hadithCollection,
  lectures,
  quranVerses,
  scholars,
  tafsirSources,
} from '../data/database';
import type { Hadith, QuranVerse } from '../data/database';
import { OpenAiClient, OpenAiError } from './openaiClient';
import { retrieveTopK } from './ragIndex';
import type { RagRetrieval } from './ragIndex';
import type {
  AlternativeResult,
  QuranData,
  RelatedLecture,
  VerificationChainNarrator,
  VerificationContext,
  VerificationEngineContext,
  VerificationError,
  VerificationGrade,
  VerificationScholar,
  VerificationSuccess,
  VerifyRequest,
} from './veriTypes';

const DAILY_LIMIT = 5;
const SOURCES_CHECKED = 14000;
const MODEL_VERSION = 'veri-rag-1.0';
const RAG_TOP_K = 6;
const rateLimitStore = new Map<string, { dayKey: string; count: number }>();

export class VerifyApiError extends Error {
  status: number;
  data: VerificationError;

  constructor(status: number, data: VerificationError) {
    super(data.message ?? data.error);
    this.name = 'VerifyApiError';
    this.status = status;
    this.data = data;
  }
}

type AnalysisKind = 'quran' | 'hadith' | 'no_source';

interface LlmAnalysis {
  kind: AnalysisKind;
  match_id: string | null;
  confidence: number;
  grade: VerificationGrade;
  cleaned_input: {
    arabic_text: string;
    english_text: string;
  };
  analyzed_statement: {
    arabic_text: string;
    english_text: string;
    source: string;
    source_url: string;
  };
  grading_chain: { status: string; label: string; description: string };
  grading_text: { status: string; label: string; description: string };
  scholars: {
    id: string;
    name: string;
    arabic_name: string;
    school: string;
    grading: string;
    work: string;
    commentary: string;
    is_preferred: boolean;
  }[];
  chain: {
    name: string;
    arabic_name: string;
    reliability: string;
    era: string;
    position: number;
  }[];
  context: {
    interpretation: string;
    note_type: string;
    note_title: string;
    note_text: string;
  };
  alternative: {
    arabic_text: string;
    english_text: string;
    source: string;
    grade: string;
  } | null;
  quran: {
    surah_number: number;
    surah_name: string;
    surah_arabic: string;
    verse_range: string;
    revelation: 'makkan' | 'madinan';
    total_verses: number;
    juz: number;
    reason_for_revelation: string;
    related_verses: { reference: string; text: string }[];
  } | null;
}

export async function verifyPayload(
  payload: VerifyRequest,
  context: VerificationEngineContext = {},
): Promise<VerificationSuccess> {
  const startedAt = Date.now();
  const authToken = context.authToken?.trim();
  if (!authToken) {
    throw new VerifyApiError(401, {
      error: 'unauthorized',
      message: 'Missing bearer token',
    });
  }

  if (!context.bypassRateLimit) {
    enforceDailyLimit(authToken, context.now ?? new Date());
  }

  const userMadhab = payload.user_madhab?.trim().toLowerCase() ?? 'shafii';
  const openAiClient = context.openAiApiKey
    ? new OpenAiClient({
        apiKey: context.openAiApiKey,
        baseUrl: context.openAiBaseUrl,
        fetchImpl: context.fetchImpl,
      })
    : null;

  const inputText = await resolveInputText(payload, openAiClient);

  if (openAiClient) {
    try {
      const response = await runRagPipeline(openAiClient, inputText, userMadhab, startedAt);
      return finalizeTiming(response, startedAt);
    } catch (error) {
      if (error instanceof VerifyApiError) {
        throw error;
      }
      if (!context.allowFallback) {
        if (error instanceof OpenAiError) {
          throw new VerifyApiError(502, {
            error: 'engine_failure',
            message: `OpenAI pipeline failed: ${error.message}`,
          });
        }
        throw new VerifyApiError(500, {
          error: 'engine_failure',
          message: error instanceof Error ? error.message : 'RAG pipeline failed',
        });
      }
    }
  } else if (!context.allowFallback) {
    throw new VerifyApiError(503, {
      error: 'engine_unconfigured',
      message: 'OpenAI API key is not configured for this environment',
    });
  }

  return finalizeTiming(runFuzzyFallback(inputText, userMadhab, startedAt), startedAt);
}

function finalizeTiming(response: VerificationSuccess, startedAt: number): VerificationSuccess {
  return {
    ...response,
    metadata: {
      ...response.metadata,
      processing_time_ms: Date.now() - startedAt,
    },
  };
}

function enforceDailyLimit(token: string, now: Date): void {
  const dayKey = now.toISOString().slice(0, 10);
  const current = rateLimitStore.get(token);
  if (!current || current.dayKey !== dayKey) {
    rateLimitStore.set(token, { dayKey, count: 1 });
    return;
  }

  if (current.count >= DAILY_LIMIT) {
    const resetsAt = new Date(`${dayKey}T00:00:00.000Z`);
    resetsAt.setUTCDate(resetsAt.getUTCDate() + 1);
    throw new VerifyApiError(429, {
      error: 'rate_limited',
      remaining_today: 0,
      resets_at: resetsAt.toISOString(),
    });
  }

  current.count += 1;
  rateLimitStore.set(token, current);
}

async function resolveInputText(
  payload: VerifyRequest,
  client: OpenAiClient | null,
): Promise<string> {
  switch (payload.type) {
    case 'text':
      return requireText(payload.text, 'Text input is required');
    case 'audio':
      if ((payload.duration_seconds ?? 0) < 10) {
        throw new VerifyApiError(400, {
          error: 'audio_too_short',
          message: 'Minimum 10 seconds required',
        });
      }
      return transcribeAudioInput(payload.audio_base64, payload.format, payload.language_hint, client);
    case 'url':
      return extractTextFromUrl(payload.url);
    default:
      throw new VerifyApiError(400, {
        error: 'invalid_type',
        message: 'Unsupported verification type',
      });
  }
}

function requireText(text: string | undefined, message: string): string {
  const value = text?.trim();
  if (!value) {
    throw new VerifyApiError(400, { error: 'invalid_request', message });
  }
  return value;
}

async function transcribeAudioInput(
  audioBase64: string,
  format: string | undefined,
  languageHint: string | undefined,
  client: OpenAiClient | null,
): Promise<string> {
  const trimmed = requireText(audioBase64, 'Audio payload is required');

  if (client) {
    try {
      const transcript = await client.transcribe({
        base64: trimmed,
        format,
        languageHint,
      });
      const text = transcript.text?.trim();
      if (text) {
        return text;
      }
    } catch (error) {
      throw new VerifyApiError(400, {
        error: 'transcription_failed',
        message:
          error instanceof OpenAiError
            ? `Whisper transcription failed: ${error.message}`
            : 'Could not transcribe audio',
      });
    }
  }

  const base64 = trimmed.includes(',') ? trimmed.split(',').pop() ?? '' : trimmed;
  try {
    const binary = globalThis.atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes).trim();
    if (looksTextual(decoded)) {
      return decoded;
    }
  } catch {
    // Fall through to the structured error below.
  }

  throw new VerifyApiError(400, {
    error: 'transcription_failed',
    message: 'Could not transcribe audio',
  });
}

async function extractTextFromUrl(rawUrl: string): Promise<string> {
  const urlValue = requireText(rawUrl, 'URL is required');
  let parsed: URL;
  try {
    parsed = new URL(urlValue);
  } catch {
    throw new VerifyApiError(400, {
      error: 'invalid_url',
      message: 'Please provide a valid URL',
    });
  }

  const transcriptHint =
    parsed.searchParams.get('transcript') ??
    parsed.searchParams.get('text') ??
    parsed.searchParams.get('caption') ??
    parsed.searchParams.get('title');
  if (transcriptHint?.trim()) {
    return transcriptHint.trim();
  }

  try {
    const response = await fetch(parsed.toString());
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

    if (contentType.includes('text/html') || contentType.includes('text/plain')) {
      const body = await response.text();
      const extracted = extractTranscriptFromHtml(body);
      if (extracted) {
        return extracted;
      }
      throw new VerifyApiError(400, {
        error: 'extraction_failed',
        message: 'Could not extract text from URL',
      });
    }

    if (contentType.startsWith('audio/') || contentType.startsWith('video/')) {
      throw new VerifyApiError(400, {
        error: 'extraction_failed',
        message: 'Direct media URL extraction requires a dedicated audio pipeline',
      });
    }
  } catch (error) {
    if (error instanceof VerifyApiError) {
      throw error;
    }
    throw new VerifyApiError(400, {
      error: 'extraction_failed',
      message: 'Could not extract content from URL',
    });
  }

  throw new VerifyApiError(400, {
    error: 'not_media',
    message: 'URL does not contain text, audio, or video content',
  });
}

function extractTranscriptFromHtml(html: string): string | null {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
  if (!stripped) {
    return null;
  }
  return stripped.length >= 30 ? stripped.slice(0, 2000) : null;
}

function looksTextual(value: string): boolean {
  const printable = value.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '').length;
  return printable > 12 && printable / Math.max(value.length, 1) > 0.75;
}

async function runRagPipeline(
  client: OpenAiClient,
  inputText: string,
  userMadhab: string,
  startedAt: number,
): Promise<VerificationSuccess> {
  const retrievals = await retrieveTopK(client, inputText, RAG_TOP_K);
  const analysis = await synthesizeWithLlm(client, inputText, retrievals, userMadhab);
  return buildResponseFromAnalysis(analysis, retrievals, startedAt);
}

async function synthesizeWithLlm(
  client: OpenAiClient,
  inputText: string,
  retrievals: RagRetrieval[],
  userMadhab: string,
): Promise<LlmAnalysis> {
  const contextBlocks = retrievals.map(formatRetrievalForPrompt).join('\n\n');
  const scholarContext = scholars
    .map((scholar) => ({
      id: scholar.id,
      name: scholar.name,
      arabic_name: scholar.arabic_name,
      school: scholar.school,
      work: scholar.work,
      related_hadith_ids: scholar.related_hadith_ids,
      commentary_hint: scholar.commentary ?? null,
    }))
    .slice(0, 8);

  const chainContext = chainNarrators
    .map((narrator) => ({
      hadith_id: narrator.hadith_id,
      position: narrator.position,
      name: narrator.name,
      arabic_name: narrator.arabic_name,
      reliability: narrator.reliability,
      era: narrator.era,
    }))
    .slice(0, 40);

  const system = [
    'You are Veri, an Islamic knowledge verification engine.',
    'Given a user statement and retrieved candidate sources (Quran verses and hadith), decide whether the statement is:',
    '- a Quran verse (grade="quran"),',
    '- a hadith (grade in sahih|hasan|daif|mukhtalaf), or',
    '- not found in the retrieved corpus (grade="no_source").',
    'Base grade decisions strictly on the provided retrieved sources and scholar context. Never fabricate narrators, chains, or scholar attributions outside the provided lists.',
    'Return only JSON matching the supplied schema. All Arabic text must be preserved verbatim.',
    'For scholars, only use entries whose id appears in the provided scholar list. Mark exactly one scholar is_preferred=true, preferring one whose school matches the user madhab when possible.',
    'For chain, only use entries from the provided narrator list that match the matched hadith_id, ordered by position ascending.',
    'For no_source, suggest an authentic alternative hadith on the same topic drawn from the retrieved candidates only.',
  ].join(' ');

  const user = [
    `User madhab preference: ${userMadhab}`,
    `User statement:\n"""${inputText}"""`,
    '',
    'Retrieved candidates (ranked by semantic similarity):',
    contextBlocks,
    '',
    'Scholar pool (only ids from here are valid):',
    JSON.stringify(scholarContext, null, 2),
    '',
    'Narrator chain pool (only rows matching the chosen match_id are valid):',
    JSON.stringify(chainContext, null, 2),
  ].join('\n');

  const schema = buildAnalysisSchema();
  return client.generateJson<LlmAnalysis>({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.1,
    jsonSchema: { name: 'VeriAnalysis', schema },
  });
}

function formatRetrievalForPrompt(retrieval: RagRetrieval, index: number): string {
  const doc = retrieval.document;
  const header = `#${index + 1} [${doc.kind}] id=${doc.id} score=${retrieval.score.toFixed(3)}`;
  if (doc.kind === 'quran') {
    const verse = doc.payload as QuranVerse;
    return [
      header,
      `Surah ${verse.surah_number} ${verse.surah_name} (${verse.surah_arabic}) ayat ${verse.verse_range}, juz ${verse.juz}, revelation=${verse.revelation}, total_verses=${verse.total_verses}`,
      `Arabic: ${verse.arabic_text}`,
      `English: ${verse.translation}`,
      `Reason for revelation: ${verse.reason_for_revelation}`,
    ].join('\n');
  }
  const hadith = doc.payload as Hadith;
  return [
    header,
    `Source: ${hadith.source} (book=${hadith.source_book}, number=${hadith.hadith_number}), narrator=${hadith.narrator}, canonical grade=${hadith.grade}`,
    `Arabic: ${hadith.arabic_text}`,
    `English: ${hadith.english_text}`,
    `Chain: ${hadith.chain_strength} — ${hadith.chain_description}`,
    `Text: ${hadith.text_strength} — ${hadith.text_description}`,
    `Context: ${hadith.context}`,
    `Note (${hadith.note_type}): ${hadith.note_title} — ${hadith.note_text}`,
  ].join('\n');
}

function buildResponseFromAnalysis(
  analysis: LlmAnalysis,
  retrievals: RagRetrieval[],
  startedAt: number,
): VerificationSuccess {
  if (analysis.kind === 'quran') {
    return buildQuranResponseFromAnalysis(analysis, retrievals, startedAt);
  }
  if (analysis.kind === 'hadith') {
    return buildHadithResponseFromAnalysis(analysis, retrievals, startedAt);
  }
  return buildNoSourceResponseFromAnalysis(analysis, startedAt);
}

function buildQuranResponseFromAnalysis(
  analysis: LlmAnalysis,
  retrievals: RagRetrieval[],
  startedAt: number,
): VerificationSuccess {
  const verse = analysis.match_id
    ? quranVerses.find((item) => item.id === analysis.match_id)
    : undefined;
  if (!verse) {
    throw new VerifyApiError(502, {
      error: 'engine_failure',
      message: 'LLM returned a Quran match that is not in the corpus',
    });
  }

  const localTafsir = tafsirSources
    .filter((item) => item.verse_id === verse.id)
    .map((item) => ({
      id: item.id,
      name: item.source,
      type: item.type.toLowerCase(),
    }));

  const relatedVerses =
    analysis.quran?.related_verses.map((item) => ({
      reference: item.reference,
      text: stripQuotes(item.text),
    })) ??
    quranVerses
      .filter((item) => item.id !== verse.id)
      .slice(0, 2)
      .map((item) => ({
        reference: `${item.surah_number}:${item.verse_range}`,
        text: stripQuotes(item.translation),
      }));

  const quranData: QuranData = {
    surah_number: analysis.quran?.surah_number ?? verse.surah_number,
    surah_name: analysis.quran?.surah_name ?? verse.surah_name,
    surah_arabic: analysis.quran?.surah_arabic ?? verse.surah_arabic,
    verse_range: analysis.quran?.verse_range ?? verse.verse_range,
    revelation: analysis.quran?.revelation ?? verse.revelation,
    total_verses: analysis.quran?.total_verses ?? verse.total_verses,
    juz: analysis.quran?.juz ?? verse.juz,
    reason_for_revelation: analysis.quran?.reason_for_revelation ?? verse.reason_for_revelation,
    tafsir_sources: localTafsir,
    related_verses: relatedVerses,
  };

  return {
    id: createVerificationId(),
    status: 'completed',
    grade: 'quran',
    confidence: roundConfidence(analysis.confidence, 0.85),
    analyzed_statement: {
      arabic_text: analysis.analyzed_statement.arabic_text || verse.arabic_text,
      english_text:
        analysis.analyzed_statement.english_text || stripQuotes(verse.translation),
      source:
        analysis.analyzed_statement.source ||
        `The Holy Quran, Surah ${verse.surah_name}, Verses ${verse.verse_range}`,
      source_url:
        analysis.analyzed_statement.source_url ||
        `https://quran.com/${verse.surah_number}/${firstVerseNumber(verse.verse_range)}`,
    },
    grading: {
      chain: analysis.grading_chain,
      text: analysis.grading_text,
    },
    scholars: [],
    chain: [],
    context: normalizeContext(analysis.context),
    quran_data: quranData,
    alternative: null,
    related_lectures: mapLectures(verse.id, 'quran'),
    metadata: {
      processing_time_ms: Date.now() - startedAt,
      sources_checked: SOURCES_CHECKED,
      model_version: MODEL_VERSION,
    },
  };
}

function buildHadithResponseFromAnalysis(
  analysis: LlmAnalysis,
  retrievals: RagRetrieval[],
  startedAt: number,
): VerificationSuccess {
  const hadith = analysis.match_id
    ? hadithCollection.find((item) => item.id === analysis.match_id)
    : undefined;
  if (!hadith) {
    throw new VerifyApiError(502, {
      error: 'engine_failure',
      message: 'LLM returned a hadith match that is not in the corpus',
    });
  }

  const allowedScholarIds = new Set(scholars.map((item) => item.id));
  const sanitizedScholars = analysis.scholars
    .filter((item) => allowedScholarIds.has(item.id))
    .map<VerificationScholar>((item) => ({
      id: `scholar_${slugify(item.name)}`,
      name: item.name,
      arabic_name: item.arabic_name,
      school: normalizeSchool(item.school),
      grading: item.grading,
      work: item.work,
      commentary: item.commentary,
      is_preferred: item.is_preferred,
    }));
  if (sanitizedScholars.length > 0 && !sanitizedScholars.some((item) => item.is_preferred)) {
    sanitizedScholars[0] = { ...sanitizedScholars[0], is_preferred: true };
  }

  const chainFromDb = chainNarrators
    .filter((item) => item.hadith_id === hadith.id)
    .sort((left, right) => left.position - right.position)
    .map<VerificationChainNarrator>((item) => ({
      name: item.name,
      arabic_name: item.arabic_name,
      reliability: item.reliability,
      era: item.era,
      position: item.position,
    }));
  const narrationChain =
    analysis.chain.length > 0
      ? analysis.chain
          .map<VerificationChainNarrator>((item) => ({
            name: item.name,
            arabic_name: item.arabic_name,
            reliability: item.reliability,
            era: item.era,
            position: item.position,
          }))
          .sort((left, right) => left.position - right.position)
      : chainFromDb;

  return {
    id: createVerificationId(),
    status: 'completed',
    grade: analysis.grade,
    confidence: roundConfidence(analysis.confidence, analysis.grade === 'mukhtalaf' ? 0.7 : 0.82),
    analyzed_statement: {
      arabic_text: analysis.analyzed_statement.arabic_text || hadith.arabic_text,
      english_text:
        analysis.analyzed_statement.english_text || stripQuotes(hadith.english_text),
      source: analysis.analyzed_statement.source || hadith.source,
      source_url:
        analysis.analyzed_statement.source_url ||
        mapSourceUrl(hadith.source_book, hadith.hadith_number),
    },
    grading: {
      chain: analysis.grading_chain,
      text: analysis.grading_text,
    },
    scholars: sanitizedScholars,
    chain: narrationChain,
    context: normalizeContext(analysis.context),
    quran_data: null,
    alternative: null,
    related_lectures: mapLectures(hadith.id, 'hadith'),
    metadata: {
      processing_time_ms: Date.now() - startedAt,
      sources_checked: SOURCES_CHECKED,
      model_version: MODEL_VERSION,
    },
  };
}

function buildNoSourceResponseFromAnalysis(
  analysis: LlmAnalysis,
  startedAt: number,
): VerificationSuccess {
  const alternative: AlternativeResult | null = analysis.alternative
    ? {
        arabic_text: analysis.alternative.arabic_text,
        english_text: analysis.alternative.english_text,
        source: analysis.alternative.source,
        grade: coerceAlternativeGrade(analysis.alternative.grade),
      }
    : null;

  return {
    id: createVerificationId(),
    status: 'completed',
    grade: 'no_source',
    confidence: roundConfidence(analysis.confidence, 0.3),
    analyzed_statement: analysis.analyzed_statement,
    grading: {
      chain: analysis.grading_chain,
      text: analysis.grading_text,
    },
    scholars: [],
    chain: [],
    context: normalizeContext(analysis.context),
    quran_data: null,
    alternative,
    related_lectures: mapLectures('h3', 'hadith'),
    metadata: {
      processing_time_ms: Date.now() - startedAt,
      sources_checked: SOURCES_CHECKED,
      model_version: MODEL_VERSION,
    },
  };
}

function coerceAlternativeGrade(
  value: string,
): Exclude<VerificationGrade, 'quran' | 'no_source'> {
  const normalized = value.toLowerCase();
  if (normalized === 'hasan' || normalized === 'daif' || normalized === 'mukhtalaf') {
    return normalized;
  }
  return 'sahih';
}

function runFuzzyFallback(
  inputText: string,
  userMadhab: string,
  startedAt: number,
): VerificationSuccess {
  const normalizedInput = normalizeText(inputText);

  const bestQuran = quranVerses
    .map((verse) => ({
      id: verse.id,
      score: Math.max(
        similarityScore(normalizedInput, normalizeText(verse.arabic_text)),
        similarityScore(normalizedInput, normalizeText(stripQuotes(verse.translation))),
        similarityScore(normalizedInput, normalizeText(`${verse.surah_name} ${verse.verse_range}`)),
      ),
    }))
    .sort((left, right) => right.score - left.score)[0];

  const bestHadith = hadithCollection
    .map((hadith) => ({
      id: hadith.id,
      score: Math.max(
        similarityScore(normalizedInput, normalizeText(hadith.arabic_text)),
        similarityScore(normalizedInput, normalizeText(stripQuotes(hadith.english_text))),
        similarityScore(normalizedInput, normalizeText(hadith.source)),
      ),
    }))
    .sort((left, right) => right.score - left.score)[0];

  const quranScore = bestQuran?.score ?? 0;
  const hadithScore = bestHadith?.score ?? 0;

  if (quranScore >= 0.48 && quranScore >= hadithScore + 0.03 && bestQuran) {
    const verse = quranVerses.find((item) => item.id === bestQuran.id)!;
    return buildFallbackQuranResponse(verse, quranScore, startedAt);
  }

  if (hadithScore >= 0.42 && bestHadith) {
    const hadith = hadithCollection.find((item) => item.id === bestHadith.id)!;
    return buildFallbackHadithResponse(hadith, userMadhab, hadithScore, startedAt);
  }

  if (quranScore >= 0.42 && bestQuran) {
    const verse = quranVerses.find((item) => item.id === bestQuran.id)!;
    return buildFallbackQuranResponse(verse, quranScore, startedAt);
  }

  return buildFallbackNoSourceResponse(inputText, startedAt);
}

function buildFallbackQuranResponse(
  verse: QuranVerse,
  score: number,
  startedAt: number,
): VerificationSuccess {
  const verseNumber = firstVerseNumber(verse.verse_range);
  const relatedVerses = quranVerses
    .filter((item) => item.id !== verse.id)
    .slice(0, 2)
    .map((item) => ({
      reference: `${item.surah_number}:${item.verse_range}`,
      text: stripQuotes(item.translation),
    }));

  const quranData: QuranData = {
    surah_number: verse.surah_number,
    surah_name: verse.surah_name,
    surah_arabic: verse.surah_arabic,
    verse_range: verse.verse_range,
    revelation: verse.revelation,
    total_verses: verse.total_verses,
    juz: verse.juz,
    reason_for_revelation: verse.reason_for_revelation,
    tafsir_sources: tafsirSources
      .filter((item) => item.verse_id === verse.id)
      .map((item) => ({
        id: item.id,
        name: item.source,
        type: item.type.toLowerCase(),
      })),
    related_verses: relatedVerses,
  };

  return {
    id: createVerificationId(),
    status: 'completed',
    grade: 'quran',
    confidence: roundConfidence(score, 0.9),
    analyzed_statement: {
      arabic_text: verse.arabic_text,
      english_text: stripQuotes(verse.translation),
      source: `The Holy Quran, Surah ${verse.surah_name}, Verses ${verse.verse_range}`,
      source_url: `https://quran.com/${verse.surah_number}/${verseNumber}`,
    },
    grading: {
      chain: {
        status: 'revelation',
        label: 'Divine Revelation',
        description: 'Quranic revelation is preserved and unquestionably authentic.',
      },
      text: {
        status: 'verified',
        label: 'Verified Verse',
        description: 'Matched to a Quran verse in the authenticated corpus.',
      },
    },
    scholars: [],
    chain: [],
    context: {
      interpretation: verse.reason_for_revelation,
      note_type: 'tafsir',
      note_title: 'Reason for revelation',
      note_text: verse.reason_for_revelation,
    },
    quran_data: quranData,
    alternative: null,
    related_lectures: mapLectures(verse.id, 'quran'),
    metadata: {
      processing_time_ms: Date.now() - startedAt,
      sources_checked: SOURCES_CHECKED,
      model_version: `${MODEL_VERSION}-fallback`,
    },
  };
}

function buildFallbackHadithResponse(
  hadith: Hadith,
  userMadhab: string,
  score: number,
  startedAt: number,
): VerificationSuccess {
  const relatedScholars = mapScholarsLocal(hadith.id, hadith.grade, userMadhab);
  const narrationChain = chainNarrators
    .filter((item) => item.hadith_id === hadith.id)
    .sort((left, right) => left.position - right.position)
    .map<VerificationChainNarrator>((item) => ({
      name: item.name,
      arabic_name: item.arabic_name,
      reliability: item.reliability,
      era: item.era,
      position: item.position,
    }));

  return {
    id: createVerificationId(),
    status: 'completed',
    grade: hadith.grade,
    confidence: roundConfidence(score, hadith.grade === 'mukhtalaf' ? 0.74 : 0.87),
    analyzed_statement: {
      arabic_text: hadith.arabic_text,
      english_text: stripQuotes(hadith.english_text),
      source: hadith.source,
      source_url: mapSourceUrl(hadith.source_book, hadith.hadith_number),
    },
    grading: {
      chain: mapChainGrading(hadith.grade, hadith.chain_strength, hadith.chain_description),
      text: {
        status: hadith.grade === 'daif' ? 'caution' : 'accepted',
        label: hadith.text_strength,
        description: hadith.text_description,
      },
    },
    scholars: relatedScholars,
    chain: narrationChain,
    context: mapContext(hadith.context, hadith.note_type, hadith.note_title, hadith.note_text),
    quran_data: null,
    alternative: null,
    related_lectures: mapLectures(hadith.id, 'hadith'),
    metadata: {
      processing_time_ms: Date.now() - startedAt,
      sources_checked: SOURCES_CHECKED,
      model_version: `${MODEL_VERSION}-fallback`,
    },
  };
}

function buildFallbackNoSourceResponse(
  inputText: string,
  startedAt: number,
): VerificationSuccess {
  const alternative = chooseAlternative(inputText);
  return {
    id: createVerificationId(),
    status: 'completed',
    grade: 'no_source',
    confidence: 0.36,
    analyzed_statement: {
      arabic_text: containsArabic(inputText) ? inputText : '',
      english_text: containsArabic(inputText)
        ? 'No verified source match found for this wording.'
        : inputText,
      source: 'No recognized source found',
      source_url: '',
    },
    grading: {
      chain: {
        status: 'not_found',
        label: 'No Source',
        description: 'No recognized chain of narration or Quranic source was matched.',
      },
      text: {
        status: 'unknown',
        label: 'Unverified',
        description: 'The statement could not be verified against the current corpus.',
      },
    },
    scholars: [],
    chain: [],
    context: {
      interpretation:
        'No exact or strong fuzzy match was found in the current Quran and hadith dataset.',
      note_type: 'misconception',
      note_title: 'Use caution when sharing',
      note_text:
        'Avoid attributing unsourced wording to the Prophet ﷺ until it is verified against recognized collections.',
    },
    quran_data: null,
    alternative,
    related_lectures: mapLectures('h3', 'hadith'),
    metadata: {
      processing_time_ms: Date.now() - startedAt,
      sources_checked: SOURCES_CHECKED,
      model_version: `${MODEL_VERSION}-fallback`,
    },
  };
}

function similarityScore(left: string, right: string): number {
  if (!left || !right) {
    return 0;
  }
  if (left === right) {
    return 1;
  }
  if (left.includes(right) || right.includes(left)) {
    return Math.min(left.length, right.length) / Math.max(left.length, right.length);
  }

  const leftTokens = tokenise(left);
  const rightTokens = tokenise(right);
  if (!leftTokens.length || !rightTokens.length) {
    return 0;
  }

  const overlap = leftTokens.filter((token) => rightTokens.includes(token)).length;
  const tokenScore = (2 * overlap) / Math.max(leftTokens.length + rightTokens.length, 1);
  const bigramScore = diceCoefficient(left, right);
  return Math.max(tokenScore, bigramScore * 0.92);
}

function tokenise(value: string): string[] {
  return value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function diceCoefficient(left: string, right: string): number {
  const leftBigrams = createBigrams(left);
  const rightBigrams = createBigrams(right);
  if (!leftBigrams.length || !rightBigrams.length) {
    return 0;
  }

  let matches = 0;
  const remaining = [...rightBigrams];
  leftBigrams.forEach((bigram) => {
    const index = remaining.indexOf(bigram);
    if (index >= 0) {
      matches += 1;
      remaining.splice(index, 1);
    }
  });
  return (2 * matches) / (leftBigrams.length + rightBigrams.length);
}

function createBigrams(value: string): string[] {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (compact.length < 2) {
    return [];
  }

  const bigrams: string[] = [];
  for (let index = 0; index < compact.length - 1; index += 1) {
    bigrams.push(compact.slice(index, index + 2));
  }
  return bigrams;
}

function normalizeText(value: string): string {
  return stripQuotes(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, '').trim();
}

function mapLectures(contentId: string, contentType: 'hadith' | 'quran'): RelatedLecture[] {
  return lectures
    .filter(
      (lecture) =>
        lecture.related_content_id === contentId &&
        lecture.related_content_type === contentType,
    )
    .slice(0, 4)
    .map((lecture, index) => ({
      id: `lec_${lecture.id}`,
      title: lecture.title,
      speaker: lecture.speaker,
      duration_seconds: durationToSeconds(lecture.duration),
      thumbnail_url: `https://cdn.qisah.app/lectures/${lecture.id}.jpg`,
      source_url: `https://youtube.com/watch?v=${lecture.id}${index}`,
    }));
}

function normalizeContext(context: LlmAnalysis['context']): VerificationContext {
  return mapContext(
    context.interpretation,
    context.note_type,
    context.note_title,
    context.note_text,
  );
}

function mapContext(
  interpretation: string,
  noteType: string,
  noteTitle: string,
  noteText: string,
): VerificationContext {
  return {
    interpretation,
    note_type: slugify(noteType || 'note'),
    note_title: noteTitle.replace(/^[^\p{L}\p{N}]+/gu, '').trim(),
    note_text: noteText,
  };
}

function mapChainGrading(
  grade: VerificationGrade,
  label: string,
  description: string,
): VerificationSuccess['grading']['chain'] {
  const statusMap: Record<VerificationGrade, string> = {
    sahih: 'strong',
    hasan: 'acceptable',
    daif: 'weak',
    mukhtalaf: 'disputed',
    quran: 'revelation',
    no_source: 'not_found',
  };
  return {
    status: statusMap[grade],
    label,
    description,
  };
}

function mapScholarsLocal(
  hadithId: string,
  grade: VerificationGrade,
  userMadhab: string,
): VerificationScholar[] {
  const ranked = scholars
    .filter((item) => item.related_hadith_ids.includes(hadithId))
    .map((item, index) => {
      const school = normalizeSchool(item.school);
      const isPreferred = school === userMadhab || (!item.school && index === 0);
      return {
        id: `scholar_${slugify(item.name)}`,
        name: item.name,
        arabic_name: item.arabic_name,
        school,
        grading: resolveScholarGrading(item.id, grade),
        work: item.work,
        commentary:
          item.commentary ??
          `${item.name} references this narration within ${item.work} and treats it as relevant to the topic.`,
        is_preferred: isPreferred,
      };
    })
    .sort((left, right) => Number(right.is_preferred) - Number(left.is_preferred));

  if (ranked.length > 0) {
    ranked[0] = { ...ranked[0], is_preferred: true };
  }

  return ranked;
}

function resolveScholarGrading(scholarId: string, grade: VerificationGrade): string {
  if (grade !== 'mukhtalaf') {
    return grade;
  }
  const disputedMap: Record<string, string> = {
    s1: 'hasan',
    s4: 'accepted',
    s5: 'daif',
  };
  return disputedMap[scholarId] ?? 'mukhtalaf';
}

function chooseAlternative(inputText: string): AlternativeResult {
  const normalized = normalizeText(inputText);
  if (normalized.includes('علم') || normalized.includes('knowledge')) {
    return {
      arabic_text: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
      english_text: 'Seeking knowledge is an obligation upon every Muslim.',
      source: 'Sunan Ibn Majah',
      grade: 'sahih',
    };
  }
  return {
    arabic_text: 'مَنْ لَمْ يَرْحَمْ صَغِيرَنَا فَلَيْسَ مِنَّا',
    english_text: 'Whoever does not show mercy to our young ones is not one of us.',
    source: 'Abu Dawud',
    grade: 'sahih',
  };
}

function mapSourceUrl(sourceBook: string, hadithNumber: string): string {
  const cleanNumber = hadithNumber.replace(/[^\d]/g, '');
  const mapping: Record<string, string> = {
    'Sahih al-Bukhari': 'bukhari',
    'Sahih Muslim': 'muslim',
    'Sunan al-Tirmidhi': 'tirmidhi',
    "Sunan al-Nasa'i": 'nasai',
    'Sunan Ibn Majah': 'ibnmajah',
    'Sunan Abu Dawud': 'abudawud',
    'Abu Dawud': 'abudawud',
  };
  const slug = mapping[sourceBook];
  return slug && cleanNumber ? `https://sunnah.com/${slug}:${cleanNumber}` : '';
}

function firstVerseNumber(verseRange: string): string {
  return verseRange.split('-')[0]?.trim() || verseRange;
}

function durationToSeconds(duration: string): number {
  const parts = duration.split(':').map((part) => Number(part));
  if (parts.length !== 2 || parts.some(Number.isNaN)) {
    return 0;
  }
  return parts[0] * 60 + parts[1];
}

function normalizeSchool(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized.includes('shafi')) {
    return 'shafii';
  }
  if (normalized.includes('hanafi')) {
    return 'hanafi';
  }
  if (normalized.includes('maliki')) {
    return 'maliki';
  }
  if (normalized.includes('hanbali')) {
    return 'hanbali';
  }
  return slugify(value);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '');
}

function roundConfidence(score: number, floor: number): number {
  const value = Math.max(floor, Math.min(0.99, score));
  return Math.round(value * 100) / 100;
}

function containsArabic(value: string): boolean {
  return /[\u0600-\u06FF]/.test(value);
}

function createVerificationId(): string {
  return `ver_${Math.random().toString(36).slice(2, 10)}`;
}

function buildAnalysisSchema(): Record<string, unknown> {
  const gradingNode = {
    type: 'object',
    additionalProperties: false,
    required: ['status', 'label', 'description'],
    properties: {
      status: { type: 'string' },
      label: { type: 'string' },
      description: { type: 'string' },
    },
  };

  const statement = {
    type: 'object',
    additionalProperties: false,
    required: ['arabic_text', 'english_text', 'source', 'source_url'],
    properties: {
      arabic_text: { type: 'string' },
      english_text: { type: 'string' },
      source: { type: 'string' },
      source_url: { type: 'string' },
    },
  };

  return {
    type: 'object',
    additionalProperties: false,
    required: [
      'kind',
      'match_id',
      'confidence',
      'grade',
      'cleaned_input',
      'analyzed_statement',
      'grading_chain',
      'grading_text',
      'scholars',
      'chain',
      'context',
      'alternative',
      'quran',
    ],
    properties: {
      kind: { type: 'string', enum: ['quran', 'hadith', 'no_source'] },
      match_id: { type: ['string', 'null'] },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      grade: {
        type: 'string',
        enum: ['sahih', 'hasan', 'daif', 'mukhtalaf', 'quran', 'no_source'],
      },
      cleaned_input: {
        type: 'object',
        additionalProperties: false,
        required: ['arabic_text', 'english_text'],
        properties: {
          arabic_text: { type: 'string' },
          english_text: { type: 'string' },
        },
      },
      analyzed_statement: statement,
      grading_chain: gradingNode,
      grading_text: gradingNode,
      scholars: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'id',
            'name',
            'arabic_name',
            'school',
            'grading',
            'work',
            'commentary',
            'is_preferred',
          ],
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            arabic_name: { type: 'string' },
            school: { type: 'string' },
            grading: { type: 'string' },
            work: { type: 'string' },
            commentary: { type: 'string' },
            is_preferred: { type: 'boolean' },
          },
        },
      },
      chain: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'arabic_name', 'reliability', 'era', 'position'],
          properties: {
            name: { type: 'string' },
            arabic_name: { type: 'string' },
            reliability: { type: 'string' },
            era: { type: 'string' },
            position: { type: 'integer', minimum: 0 },
          },
        },
      },
      context: {
        type: 'object',
        additionalProperties: false,
        required: ['interpretation', 'note_type', 'note_title', 'note_text'],
        properties: {
          interpretation: { type: 'string' },
          note_type: { type: 'string' },
          note_title: { type: 'string' },
          note_text: { type: 'string' },
        },
      },
      alternative: {
        type: ['object', 'null'],
        additionalProperties: false,
        required: ['arabic_text', 'english_text', 'source', 'grade'],
        properties: {
          arabic_text: { type: 'string' },
          english_text: { type: 'string' },
          source: { type: 'string' },
          grade: { type: 'string' },
        },
      },
      quran: {
        type: ['object', 'null'],
        additionalProperties: false,
        required: [
          'surah_number',
          'surah_name',
          'surah_arabic',
          'verse_range',
          'revelation',
          'total_verses',
          'juz',
          'reason_for_revelation',
          'related_verses',
        ],
        properties: {
          surah_number: { type: 'integer' },
          surah_name: { type: 'string' },
          surah_arabic: { type: 'string' },
          verse_range: { type: 'string' },
          revelation: { type: 'string', enum: ['makkan', 'madinan'] },
          total_verses: { type: 'integer' },
          juz: { type: 'integer' },
          reason_for_revelation: { type: 'string' },
          related_verses: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['reference', 'text'],
              properties: {
                reference: { type: 'string' },
                text: { type: 'string' },
              },
            },
          },
        },
      },
    },
  };
}
