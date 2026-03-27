export type ApiError = { error: string; details?: any };

export async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, { ...opts, headers: { ...(opts.headers || {}) } });
  const text = await res.text();

  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!res.ok) {
    throw {
      status: res.status,
      statusText: res.statusText,
      body: text,
      json: payload
    };
  }

  return (payload ?? ({} as any)) as T;
}

export function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}