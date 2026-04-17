import { VerifyApiError, verifyPayload } from '../../src/lib/veriEngine';
import type { VerifyRequest } from '../../src/lib/veriTypes';

type RequestLike = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  end: () => void;
};

export default async function handler(req: RequestLike, res: ResponseLike) {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'method_not_allowed',
      message: 'Only POST is supported',
    });
    return;
  }

  try {
    const authHeader = readHeader(req.headers.authorization);
    const payload = parseBody(req.body);
    const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
    const openAiBaseUrl = process.env.OPENAI_BASE_URL?.trim();
    const allowFallback = process.env.VERI_ALLOW_FALLBACK === 'true';

    const result = await verifyPayload(payload, {
      authToken: authHeader.replace(/^Bearer\s+/i, ''),
      openAiApiKey,
      openAiBaseUrl: openAiBaseUrl || undefined,
      allowFallback,
    });
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof VerifyApiError) {
      res.status(error.status).json(error.data);
      return;
    }

    res.status(500).json({
      error: 'internal_error',
      message: 'Unexpected verification failure',
    });
  }
}

function parseBody(body: unknown): VerifyRequest {
  if (!body) {
    throw new VerifyApiError(400, {
      error: 'invalid_request',
      message: 'Request body is required',
    });
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as VerifyRequest;
    } catch {
      throw new VerifyApiError(400, {
        error: 'invalid_json',
        message: 'Request body must be valid JSON',
      });
    }
  }

  return body as VerifyRequest;
}

function readHeader(value: string | string[] | undefined): string {
  if (!value) {
    throw new VerifyApiError(401, {
      error: 'unauthorized',
      message: 'Missing bearer token',
    });
  }

  return Array.isArray(value) ? value[0] : value;
}

function applyCors(res: ResponseLike): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}
