const API_BASE = '/api';

export type ApiError = {
  error?: string;
  message?: string;
  issues?: Array<{ path: string; message: string }>;
};

class ApiErrorClass extends Error {
  status: number;
  error?: string;
  issues?: ApiError['issues'];
  constructor(status: number, message: string, error?: string, issues?: ApiError['issues']) {
    super(message);
    this.status = status;
    this.error = error;
    this.issues = issues;
    this.name = 'ApiError';
  }
}

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init?.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${input.toString().startsWith('http') ? '' : ''}${input}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let body: ApiError = { message: `Request failed (${res.status})` };
    try {
      body = (await res.json()) as ApiError;
    } catch {}
    throw new ApiErrorClass(
      res.status,
      body.message || `Request failed (${res.status})`,
      body.error,
      body.issues
    );
  }

  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' }),
};

export { ApiErrorClass };
