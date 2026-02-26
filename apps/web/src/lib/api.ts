import { createClient } from '@/lib/supabase/client';

// Normalize: ensure /api/v1 is always present (NestJS global prefix)
const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const API_URL = base.endsWith('/api/v1') ? base : `${base.replace(/\/$/, '')}/api/v1`;

// Anti-redirect-loop guard: prevents infinite 401 → /login → /dashboard → 401 cycles
let lastAuthRedirectTime = 0;

// Timeout helper: races a promise against a timer
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms);
    promise
      .then((v) => { clearTimeout(timer); resolve(v); })
      .catch((e) => { clearTimeout(timer); reject(e); });
  });
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    // Timeout getSession to avoid hanging indefinitely (e.g. if Supabase token refresh stalls)
    const supabase = createClient();
    const { data: { session } } = await withTimeout(
      supabase.auth.getSession(),
      5000,
      'getSession',
    );

    if (session?.access_token) {
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      };
    }
    console.warn('[API] No session/access_token available — sending request without auth');
  } catch (err) {
    console.warn('[API] getAuthHeaders failed:', err instanceof Error ? err.message : err);
  }

  return { 'Content-Type': 'application/json' };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    // Prevent redirect loops: only redirect once every 5 seconds
    const now = Date.now();
    if (now - lastAuthRedirectTime > 5000) {
      lastAuthRedirectTime = now;
      // Use server-side logout to properly clear session cookies
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/logout';
      }
    }
    throw new Error('Session expiree — reconnexion necessaire');
  }

  if (!response.ok) {
    let errorMessage = `Erreur ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorMessage;
    } catch {
      // Response body is not JSON — use status code
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

const FETCH_TIMEOUT_MS = 15000;

async function fetchWithTimeout(
  url: string,
  opts: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = FETCH_TIMEOUT_MS, ...fetchOpts } = opts;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...fetchOpts, signal: controller.signal });
    return res;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Délai dépassé — l'API ne répond pas (${timeout / 1000}s)`);
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

export const api = {
  async get<T>(path: string): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${API_URL}${path}`, { headers });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${API_URL}${path}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async put<T>(path: string, body?: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${API_URL}${path}`, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${API_URL}${path}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse<T>(response);
  },
};
