const OPENAI_BASE_URL = 'https://api.openai.com/v1';

export const OPENAI_MODELS = {
  transcription: 'whisper-1',
  embedding: 'text-embedding-3-small',
  generation: 'gpt-4o-2024-08-06',
} as const;

export class OpenAiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = 'OpenAiError';
    this.status = status;
    this.body = body;
  }
}

export interface OpenAiConfig {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  jsonSchema?: { name: string; schema: Record<string, unknown> };
}

interface EmbeddingResponse {
  data: { embedding: number[] }[];
}

interface ChatCompletionResponse {
  choices: { message: { content: string } }[];
}

interface TranscriptionResponse {
  text: string;
  language?: string;
}

export class OpenAiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: OpenAiConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAiClient requires an apiKey');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? OPENAI_BASE_URL).replace(/\/+$/, '');
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async embed(inputs: string[], model: string = OPENAI_MODELS.embedding): Promise<number[][]> {
    if (inputs.length === 0) {
      return [];
    }
    const response = await this.request<EmbeddingResponse>('/embeddings', {
      method: 'POST',
      body: JSON.stringify({ model, input: inputs }),
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data.map((item) => item.embedding);
  }

  async transcribe(audio: {
    base64: string;
    format?: string;
    languageHint?: string;
  }): Promise<TranscriptionResponse> {
    const mime = mimeForFormat(audio.format);
    const bytes = decodeBase64(audio.base64);
    const blob = new Blob([bytes as BlobPart], { type: mime });
    const filename = `audio.${audio.format ?? 'm4a'}`;
    const form = new FormData();
    form.append('file', blob, filename);
    form.append('model', OPENAI_MODELS.transcription);
    form.append('response_format', 'json');
    if (audio.languageHint) {
      form.append('language', audio.languageHint);
    }

    return this.request<TranscriptionResponse>('/audio/transcriptions', {
      method: 'POST',
      body: form,
    });
  }

  async generateJson<T>(options: ChatCompletionOptions): Promise<T> {
    const body: Record<string, unknown> = {
      model: options.model ?? OPENAI_MODELS.generation,
      temperature: options.temperature ?? 0.2,
      messages: options.messages,
    };

    if (options.jsonSchema) {
      body.response_format = {
        type: 'json_schema',
        json_schema: {
          name: options.jsonSchema.name,
          schema: options.jsonSchema.schema,
          strict: true,
        },
      };
    } else {
      body.response_format = { type: 'json_object' };
    }

    const response = await this.request<ChatCompletionResponse>('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const raw = response.choices[0]?.message?.content ?? '';
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      throw new OpenAiError(502, raw, 'Model returned invalid JSON');
    }
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      ...(init.headers as Record<string, string> | undefined),
    };

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      let parsed: unknown = null;
      try {
        parsed = await response.json();
      } catch {
        parsed = await response.text().catch(() => null);
      }
      const message =
        (parsed && typeof parsed === 'object' && 'error' in parsed
          ? (parsed as { error: { message?: string } }).error?.message
          : undefined) ?? `OpenAI request failed (${response.status})`;
      throw new OpenAiError(response.status, parsed, message);
    }

    return (await response.json()) as T;
  }
}

function mimeForFormat(format: string | undefined): string {
  switch ((format ?? '').toLowerCase()) {
    case 'm4a':
    case 'mp4':
      return 'audio/mp4';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'webm':
      return 'audio/webm';
    case 'ogg':
      return 'audio/ogg';
    case 'flac':
      return 'audio/flac';
    default:
      return 'application/octet-stream';
  }
}

function decodeBase64(value: string): Uint8Array {
  const payload = value.includes(',') ? value.split(',').pop() ?? '' : value;
  const binary = globalThis.atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
