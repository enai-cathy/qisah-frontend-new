import { hadithCollection, quranVerses } from '../data/database';
import type { Hadith, QuranVerse } from '../data/database';
import type { OpenAiClient } from './openaiClient';

export type RagSourceKind = 'quran' | 'hadith';

export interface RagDocument {
  id: string;
  kind: RagSourceKind;
  text: string;
  payload: QuranVerse | Hadith;
}

export interface RagRetrieval {
  document: RagDocument;
  score: number;
}

interface RagEntry extends RagDocument {
  embedding: number[];
}

let cachedIndex: Promise<RagEntry[]> | null = null;
let cachedIndexKey: string | null = null;

function buildDocuments(): RagDocument[] {
  const documents: RagDocument[] = [];

  quranVerses.forEach((verse) => {
    documents.push({
      id: verse.id,
      kind: 'quran',
      text: [
        `Surah ${verse.surah_name} (${verse.surah_arabic}) ${verse.surah_number}:${verse.verse_range}`,
        verse.arabic_text,
        verse.translation,
        verse.reason_for_revelation,
      ]
        .filter(Boolean)
        .join('\n'),
      payload: verse,
    });
  });

  hadithCollection.forEach((hadith) => {
    documents.push({
      id: hadith.id,
      kind: 'hadith',
      text: [
        hadith.source,
        `Narrated by ${hadith.narrator}`,
        hadith.arabic_text,
        hadith.english_text,
        hadith.context,
      ]
        .filter(Boolean)
        .join('\n'),
      payload: hadith,
    });
  });

  return documents;
}

async function loadIndex(client: OpenAiClient): Promise<RagEntry[]> {
  const documents = buildDocuments();
  const embeddings = await client.embed(documents.map((doc) => doc.text));
  if (embeddings.length !== documents.length) {
    throw new Error('Embedding count mismatch while building RAG index');
  }
  return documents.map((doc, index) => ({ ...doc, embedding: embeddings[index] }));
}

export async function getOrBuildRagIndex(client: OpenAiClient): Promise<RagEntry[]> {
  const key = fingerprintCorpus();
  if (cachedIndex && cachedIndexKey === key) {
    return cachedIndex;
  }
  cachedIndexKey = key;
  cachedIndex = loadIndex(client).catch((error) => {
    cachedIndex = null;
    cachedIndexKey = null;
    throw error;
  });
  return cachedIndex;
}

export async function retrieveTopK(
  client: OpenAiClient,
  query: string,
  k: number,
): Promise<RagRetrieval[]> {
  const cleaned = query.trim();
  if (!cleaned) {
    return [];
  }
  const [queryEmbedding] = await client.embed([cleaned]);
  const index = await getOrBuildRagIndex(client);

  return index
    .map<RagRetrieval>((entry) => ({
      document: { id: entry.id, kind: entry.kind, text: entry.text, payload: entry.payload },
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, k));
}

export function resetRagIndex(): void {
  cachedIndex = null;
  cachedIndexKey = null;
}

function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length !== right.length || left.length === 0) {
    return 0;
  }
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }
  const denom = Math.sqrt(leftNorm) * Math.sqrt(rightNorm);
  return denom === 0 ? 0 : dot / denom;
}

function fingerprintCorpus(): string {
  return `${quranVerses.length}:${hadithCollection.length}`;
}
