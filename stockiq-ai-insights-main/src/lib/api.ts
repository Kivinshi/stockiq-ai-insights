//const API_URL = import.meta.env.VITE_API_URL;

//// =====================================================
//// ================= ERROR PARSER =======================
//// =====================================================
//function getErrorMessage(text: string) {
//    try {
//        const json = JSON.parse(text);
//        return json.message || text;
//    } catch {
//        return text;
//    }
//}

//// =====================================================
//// ================= TOKEN FROM STORAGE =================
//// =====================================================
//function getToken(): string | null {
//    if (typeof window === "undefined") return null;

//    const session = localStorage.getItem("stockiq-session");
//    if (!session) return null;

//    try {
//        return JSON.parse(session).token;
//    } catch {
//        return null;
//    }
//}

//// =====================================================
//// ================= BASE REQUEST =======================
//// =====================================================
//async function request<T>(
//    path: string,
//    options: RequestInit = {},
//    manualToken?: string,
//): Promise<T> {
//    const token = manualToken || getToken();

//    const res = await fetch(`${API_URL}${path}`, {
//        ...options,
//        headers: {
//            ...(options.body ? { "Content-Type": "application/json" } : {}),
//            ...(token ? { Authorization: `Bearer ${token}` } : {}),
//            ...options.headers,
//        },
//    });

//    if (!res.ok) {
//        const text = await res.text();
//        throw new Error(getErrorMessage(text) || "Request failed");
//    }

//    return res.json();
//}

//// =====================================================
//// ======================= GET ==========================
//// =====================================================
//export function apiGet<TResponse>(path: string, token?: string): Promise<TResponse> {
//    return request<TResponse>(path, { method: "GET" }, token);
//}

//// =====================================================
//// ======================= POST =========================
//// =====================================================
//export function apiPost<TResponse, TBody>(
//    path: string,
//    body: TBody,
//    token?: string,
//): Promise<TResponse> {
//    return request<TResponse>(
//        path,
//        {
//            method: "POST",
//            body: JSON.stringify(body),
//        },
//        token,
//    );
//}

//// =====================================================
//// ======================== PUT =========================
//// =====================================================
//export function apiPut<TResponse, TBody>(
//    path: string,
//    body: TBody,
//    token?: string,
//): Promise<TResponse> {
//    return request<TResponse>(
//        path,
//        {
//            method: "PUT",
//            body: JSON.stringify(body),
//        },
//        token,
//    );
//}

//// =====================================================
//// ====================== DELETE ========================
//// =====================================================
//export function apiDelete<TResponse>(path: string, token?: string): Promise<TResponse> {
//    return request<TResponse>(
//        path,
//        {
//            method: "DELETE",
//        },
//        token,
//    );
//}

const API_URL = import.meta.env.VITE_API_URL;
const SESSION_KEY = "stockiq-session";

// =====================================================
// ================= ERROR PARSER =======================
// =====================================================
function getErrorMessage(text: string) {
  try {
    const json = JSON.parse(text);
    return json.message || text;
  } catch {
    return text;
  }
}

// =====================================================
// ================= TOKEN FROM STORAGE =================
// =====================================================
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

// =====================================================
// ================= BASE REQUEST =======================
// =====================================================
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

  // 204 No Content handle
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// =====================================================
// ======================= GET ==========================
// =====================================================
export function apiGet<TResponse>(path: string, token?: string): Promise<TResponse> {
  return request<TResponse>(path, { method: "GET" }, token);
}

// =====================================================
// ======================= POST =========================
// =====================================================
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

// =====================================================
// ======================== PUT =========================
// =====================================================
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

// =====================================================
// ====================== DELETE ========================
// =====================================================
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
