const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5281";
const SESSION_KEY = "stockiq-session";

function getErrorMessage(text: string) {
  try {
    const json = JSON.parse(text);
    return json.message || text;
  } catch {
    return text;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;

  try {
    return JSON.parse(session).token || null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  manualToken?: string,
): Promise<T> {
  const token = manualToken ?? getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(getErrorMessage(text) || "Request failed");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export function apiGet<TResponse>(path: string, token?: string): Promise<TResponse> {
  return request<TResponse>(path, { method: "GET" }, token);
}

export function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
  token?: string,
): Promise<TResponse> {
  return request<TResponse>(
    path,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    token,
  );
}

export function apiPut<TResponse, TBody>(
  path: string,
  body: TBody,
  token?: string,
): Promise<TResponse> {
  return request<TResponse>(
    path,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
    token,
  );
}

export function apiDelete<TResponse = { message: string }>(
  path: string,
  token?: string,
): Promise<TResponse> {
  return request<TResponse>(
    path,
    {
      method: "DELETE",
    },
    token,
  );
}
