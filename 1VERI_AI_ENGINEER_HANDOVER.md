# VERI ENGINE — AI Engineer Handover Brief
## From: Qisah Frontend Team
## Date: April 2026

---

## WHAT IS VERI?

Veri is the AI backend engine that powers Qisah. Think of it like Shazam, but for Islamic knowledge. A user plays an audio clip, pastes a URL, or types text — Veri processes it and returns a structured verification result identifying the source, grading, scholarly opinions, and chain of narration.

Veri runs in the background. It does NOT manage the database. The app fetches structured Islamic data first, then Veri enhances it with AI analysis.

---

## YOUR JOB

Build a single API endpoint that:
1. Accepts audio (base64), a URL, or raw text
2. Transcribes audio to text (if audio/URL)
3. Matches the text against Islamic source databases
4. Returns a structured JSON result

---

## API ENDPOINT

```
POST https://api.qisah.app/v1/verify
Authorization: Bearer <user_jwt_token>
```

### Request formats:

**Audio:**
```json
{
  "type": "audio",
  "audio_base64": "<base64 encoded audio>",
  "format": "m4a",
  "duration_seconds": 15,
  "language_hint": "ar",
  "user_madhab": "shafii"
}
```

**URL (TikTok, YouTube, Instagram, any video/audio URL):**
```json
{
  "type": "url",
  "url": "https://tiktok.com/@user/video/12345",
  "user_madhab": "shafii"
}
```

**Text:**
```json
{
  "type": "text",
  "text": "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
  "user_madhab": "shafii"
}
```

---

## RESPONSE FORMAT (THIS IS CRITICAL — MATCH THIS EXACTLY)

The frontend is already built to consume this exact JSON shape. If you change field names, the frontend breaks.

### Success Response (200):

```json
{
  "id": "ver_abc123",
  "status": "completed",
  "grade": "sahih",
  "confidence": 0.94,

  "analyzed_statement": {
    "arabic_text": "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ...",
    "english_text": "Actions are judged by intentions...",
    "source": "Sahih al-Bukhari, Book 1, Hadith 1",
    "source_url": "https://sunnah.com/bukhari:1"
  },

  "grading": {
    "chain": {
      "status": "strong",
      "label": "Strong Link",
      "description": "Continuous reliable chain of narration"
    },
    "text": {
      "status": "accepted",
      "label": "Accepted",
      "description": "Aligns with Quran and other authentic texts"
    }
  },

  "scholars": [
    {
      "id": "scholar_nawawi",
      "name": "Imam al-Nawawi",
      "arabic_name": "أبو زكريا يحيى بن شرف النووي",
      "school": "shafii",
      "grading": "sahih",
      "work": "Riyadh as-Salihin",
      "commentary": "Places this hadith first in his 40 Hadith collection...",
      "is_preferred": true
    }
  ],

  "chain": [
    {
      "name": "Prophet Muhammad ﷺ",
      "arabic_name": "النبي محمد ﷺ",
      "reliability": "infallible",
      "era": "Prophet",
      "position": 0
    },
    {
      "name": "Umar ibn al-Khattab",
      "arabic_name": "عمر بن الخطاب",
      "reliability": "trustworthy",
      "era": "Companion",
      "position": 1
    }
  ],

  "context": {
    "interpretation": "This narration is one of the most fundamental principles...",
    "note_type": "misconception",
    "note_title": "Common misconception",
    "note_text": "Good intentions do not justify impermissible actions..."
  },

  "quran_data": null,

  "alternative": null,

  "related_lectures": [
    {
      "id": "lec_001",
      "title": "Understanding intentions in Islam",
      "speaker": "Sh. Hamza Yusuf",
      "duration_seconds": 750,
      "thumbnail_url": "https://cdn.qisah.app/lectures/lec_001.jpg",
      "source_url": "https://youtube.com/watch?v=..."
    }
  ],

  "metadata": {
    "processing_time_ms": 2400,
    "sources_checked": 14000,
    "model_version": "veri-1.0"
  }
}
```

---

## GRADE VALUES (6 types)

| Grade | Meaning | When to return |
|-------|---------|----------------|
| `sahih` | Authentic | Strong chain, accepted text |
| `hasan` | Good | Acceptable chain, minor weakness |
| `daif` | Weak | Broken or unreliable chain |
| `mukhtalaf` | Disputed | Scholars disagree on grading |
| `quran` | Quranic verse | Matched to Quran text |
| `no_source` | Not found | No match in any collection |

---

## QURAN-SPECIFIC RESPONSE

When `grade` is `"quran"`, include `quran_data`:

```json
{
  "quran_data": {
    "surah_number": 94,
    "surah_name": "Ash-Sharh",
    "surah_arabic": "الشرح",
    "verse_range": "5-6",
    "revelation": "makkan",
    "total_verses": 8,
    "juz": 30,
    "reason_for_revelation": "Revealed to reassure the Prophet ﷺ...",
    "tafsir_sources": [
      { "id": "t1", "name": "Tafsir Ibn Kathir", "type": "classic" },
      { "id": "t2", "name": "Tafsir al-Tabari", "type": "comprehensive" }
    ],
    "related_verses": [
      { "reference": "2:286", "text": "Allah does not burden a soul..." },
      { "reference": "65:7", "text": "After hardship, Allah will bring ease" }
    ]
  }
}
```

---

## NO SOURCE RESPONSE

When `grade` is `"no_source"`, include `alternative`:

```json
{
  "alternative": {
    "arabic_text": "من لم يرحم صغيرنا...",
    "english_text": "Whoever does not show mercy to our young ones...",
    "source": "Abu Dawud",
    "grade": "sahih"
  }
}
```

This gives the user an authentic hadith on the same topic as a replacement.

---

## ERROR RESPONSES

```json
// 400 — Audio too short
{ "error": "audio_too_short", "message": "Minimum 10 seconds required" }

// 400 — Can't extract audio from URL
{ "error": "extraction_failed", "message": "Could not extract audio from URL" }

// 400 — URL is not audio/video
{ "error": "not_media", "message": "URL does not contain audio or video content" }

// 429 — Free tier rate limit (5/day)
{ "error": "rate_limited", "remaining_today": 0, "resets_at": "2026-04-08T00:00:00Z" }

// 402 — Premium feature required
{ "error": "premium_required", "feature": "deep_research" }
```

---

## PROCESSING PIPELINE (Current LLM / RAG Architecture)

Veri is now implemented end-to-end as an LLM + Retrieval-Augmented-Generation pipeline powered by OpenAI. Every stage that previously relied on hand-tuned heuristics is now LLM-driven.

```
1. INPUT
   ├── Audio (base64)  → OpenAI Whisper (whisper-1)                    → transcript
   ├── URL             → HTML/text fetch (or Whisper for direct audio) → transcript
   └── Text            → passed through as-is

2. EMBEDDING
   └── OpenAI text-embedding-3-small
       The unified Quran + Hadith corpus is embedded once on cold start and cached
       in-process. Each user input is embedded on the fly.

3. RETRIEVAL (vector search)
   ├── Cosine similarity against the cached corpus index
   └── Top-K candidates (K = 6) returned with scores + payloads

4. GENERATION (LLM synthesis)
   └── GPT-4o (response_format: json_schema, strict mode)
       Receives: user statement, top-K retrievals, scholar pool, narrator pool,
                 user madhab preference.
       Returns:  structured JSON containing
                 kind (quran | hadith | no_source), match_id, grade,
                 analyzed_statement, grading_chain, grading_text,
                 scholars[], chain[], context, alternative, quran{}.
       Constraints enforced in the system prompt:
         - grade is one of sahih | hasan | daif | mukhtalaf | quran | no_source
         - scholars only referenced by id from the provided pool
         - narrator chain only from the provided pool, matching chosen hadith
         - no fabricated attributions

5. POST-PROCESSING / ENRICHMENT
   ├── LLM scholar output sanitized against the scholar corpus id set
   ├── Exactly one scholar marked is_preferred (madhab-aware fallback)
   ├── Chain merged with local ChainNarrator table if LLM returned empty
   ├── Related lectures attached from local corpus
   └── Tafsir sources attached for Quran matches

6. RESPONSE
   └── Returns the existing VerificationSuccess JSON (frontend contract unchanged)
```

### Implementation files
- [qisah-mvp/src/lib/openaiClient.ts](qisah-mvp/src/lib/openaiClient.ts) — fetch-based OpenAI wrapper (transcribe, embed, generateJson)
- [qisah-mvp/src/lib/ragIndex.ts](qisah-mvp/src/lib/ragIndex.ts) — builds + caches the vector index, performs cosine top-K retrieval
- [qisah-mvp/src/lib/veriEngine.ts](qisah-mvp/src/lib/veriEngine.ts) — orchestrates the full transcribe → embed → retrieve → generate pipeline
- [qisah-mvp/api/v1/verify.ts](qisah-mvp/api/v1/verify.ts) — serverless handler that wires env vars into the engine

### Environment variables
| Variable | Where | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | server (Vercel) | Required for the RAG pipeline |
| `OPENAI_BASE_URL` | server (optional) | Override for proxies or Azure OpenAI |
| `VERI_ALLOW_FALLBACK` | server (optional) | `"true"` to fall back to fuzzy matching if OpenAI fails |
| `VITE_OPENAI_API_KEY` | client dev (optional) | Enables the pipeline when running the browser-side engine shim |
| `VITE_ALLOW_LOCAL_FALLBACK` | client dev (optional) | Defaults to true; set `"false"` to require the live API |

### Model choices (tunable in `openaiClient.ts`)
- `whisper-1` for transcription
- `text-embedding-3-small` for semantic matching
- `gpt-4o-2024-08-06` with strict JSON Schema for structured generation

---

## DATABASES YOU NEED

Your AI needs access to these Islamic text databases:

1. **Hadith Collections**
   - Sahih al-Bukhari (~7,563 hadith)
   - Sahih Muslim (~7,500 hadith)
   - Sunan Abu Dawud (~5,274 hadith)
   - Sunan al-Tirmidhi (~3,956 hadith)
   - Sunan al-Nasa'i (~5,758 hadith)
   - Sunan Ibn Majah (~4,341 hadith)
   - Plus secondary collections

2. **Quran** — All 6,236 verses with Arabic + English

3. **Tafsir** — At minimum: Ibn Kathir, al-Tabari, al-Qurtubi

4. **Scholar Database** — Major scholars with their gradings per hadith

5. **Chain Database** — Narrator biographies with reliability ratings

**Free data sources:**
- sunnah.com API (hadith collections)
- quran.com API (Quran text + translations)
- tanzil.net (Quran data download)

---

## WEBHOOK FOR REAL-TIME PROCESSING

For long audio clips, use async processing:

```
POST https://api.qisah.app/v1/webhooks/status
{
  "verification_id": "ver_abc123",
  "status": "processing",
  "progress": 0.75,
  "current_phase": "matching_sources"
}
```

The frontend scan screen already shows 4 phases:
1. "Listening..." (0-25%)
2. "Detecting speech..." (25-50%)
3. "Matching sources..." (50-75%)
4. "Verifying..." (75-100%)

Your webhook updates map to these phases.

---

## AUTH ENDPOINTS (for backend developer, not AI engineer)

These are for the backend developer to implement alongside your work:

```
POST /auth/signup    → { username, email, password }
POST /auth/login     → { email, password }
GET  /users          → admin only
POST /auth/forgot    → { email } → sends OTP
POST /auth/verify    → { email, otp }
POST /auth/reset     → { email, new_password }
```

---

## WHAT THE FRONTEND CURRENTLY DOES (so you know what NOT to build)

The frontend handles:
- All UI rendering
- User authentication (mock, will connect to your auth endpoints)
- Scan animation and phases
- Result display for all 6 grade types
- Scholar card expansion/collapse
- Chain visualization
- Share sheet
- Save/bookmark system
- Dark mode
- Paywall/subscription logic
- Admin panel

You do NOT need to build any UI. You only build the API that returns JSON.

---

## HOW FRONTEND WILL INTEGRATE YOUR API

The frontend developer will replace this mock function:

```typescript
// Current (mock):
const result = getMockResult(grade)

// After integration:
const response = await fetch('https://api.qisah.app/v1/verify', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'audio', audio_base64: audioData })
})
const result = await response.json()
```

That's it. The JSON shape stays the same. The frontend renders it identically.

---

## PRIORITY ORDER

1. **Text matching** — Get this working first (easiest)
2. **Quran detection** — High accuracy, finite dataset
3. **Hadith grading** — Core product value
4. **Audio transcription** — Integrate Whisper
5. **URL extraction** — Parse TikTok/YouTube/Instagram audio
6. **Scholar opinions** — Enrichment layer
7. **Chain narration** — Deep research feature

---

## CONTACT

Questions? Reach out to the product team. The Figma file with all designs is at:
https://www.figma.com/design/44GhCKPJb2qkCjflYvqXQo/Clustered

The mock data layer in `src/data/database.ts` shows exactly what data shapes the frontend expects. Study it carefully — your API output must match these shapes.
