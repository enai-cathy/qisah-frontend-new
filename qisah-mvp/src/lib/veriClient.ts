import { VerifyApiError, verifyPayload } from './veriEngine';
import type { VerificationError, VerificationSuccess, VerifyRequest } from './veriTypes';

const DEFAULT_TOKEN = 'demo-qisah-user';

interface ViteEnv {
  VITE_API_BASE_URL?: string;
  VITE_OPENAI_API_KEY?: string;
  VITE_OPENAI_BASE_URL?: string;
  VITE_ALLOW_LOCAL_FALLBACK?: string;
}

export async function submitVerification(
  payload: VerifyRequest,
  token = DEFAULT_TOKEN,
): Promise<VerificationSuccess> {
  const env = getEnv();
  const endpoint = `${resolveApiBaseUrl(env)}/v1/verify`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (!response.ok) {
      if (response.status === 404 || contentType.includes('text/html')) {
        return runBrowserEngine(payload, token, env);
      }

      const errorData = contentType.includes('application/json')
        ? ((await response.json()) as VerificationError)
        : { error: 'request_failed', message: 'Verification request failed' };
      throw new VerifyApiError(response.status, errorData);
    }

    return (await response.json()) as VerificationSuccess;
  } catch (error) {
    if (error instanceof VerifyApiError) {
      throw error;
    }

    return runBrowserEngine(payload, token, env);
  }
}

function runBrowserEngine(
  payload: VerifyRequest,
  token: string,
  env: ViteEnv,
): Promise<VerificationSuccess> {
  const openAiApiKey = env.VITE_OPENAI_API_KEY?.trim();
  const openAiBaseUrl = env.VITE_OPENAI_BASE_URL?.trim();
  const allowFallback = env.VITE_ALLOW_LOCAL_FALLBACK !== 'false';

  return verifyPayload(payload, {
    authToken: token,
    openAiApiKey: openAiApiKey || undefined,
    openAiBaseUrl: openAiBaseUrl || undefined,
    allowFallback,
  });
}

function resolveApiBaseUrl(env: ViteEnv): string {
  return env.VITE_API_BASE_URL?.replace(/\/+$/, '') || '/api';
}

function getEnv(): ViteEnv {
  return (
    (import.meta as ImportMeta & { env?: ViteEnv }).env ?? {}
  );
}
