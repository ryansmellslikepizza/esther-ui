/*
Examples Usage:
// GET
const health = await api.get("/api/health");

// POST
const reg = await api.post("/api/register", { email, password, isAdmin: false });

// PUT (update)
await api.put(`/api/users/${userId}`, { name: "Ryan" });

// PATCH
await api.patch(`/api/prompts/${promptId}`, { isActive: true });

// DELETE
await api.del(`/api/prompts/${promptId}`);
*/

const API_HOST =
  process.env.NEXT_PUBLIC_API_HOST ||
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:3000"
    : "https://api.yourdomain.com");


console.log("API HOST:", API_HOST)

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiFetchOptions = Omit<RequestInit, "method" | "body"> & {
  method?: ApiMethod;
  body?: any; // object | string | FormData | undefined
};

function isFormData(x: any): x is FormData {
  return typeof FormData !== "undefined" && x instanceof FormData;
}

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = `${API_HOST}${path.startsWith("/") ? path : `/${path}`}`;

  const method: ApiMethod = (options.method || "GET").toUpperCase() as ApiMethod;

  // If body is a plain object, JSON stringify it.
  const hasBody = options.body !== undefined && options.body !== null;
  const body =
    hasBody && typeof options.body === "object" && !isFormData(options.body)
      ? JSON.stringify(options.body)
      : (options.body as any);

  // Only set JSON content-type if we're sending JSON.
  const shouldSetJsonContentType =
    hasBody && typeof body === "string" && !isFormData(options.body);

  const headers: Record<string, string> = {
    ...(shouldSetJsonContentType ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(url, {
    ...options,
    method,
    credentials: "include",
    headers,
    body,
  });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") || "";

  // Try to parse response
  let payload: any = null;
  if (contentType.includes("application/json")) {
    payload = await res.json().catch(() => null);
  } else {
    payload = await res.text().catch(() => "");
  }

  if (!res.ok) {
    const msg =
      (typeof payload === "object" && payload && (payload.error || payload.message)) ||
      (typeof payload === "string" && payload.trim()) ||
      `Request failed (${res.status})`;

    throw new Error(msg);
  }

  return payload as T;
}

// Optional convenience helpers
export const api = {
  get: <T = any>(path: string, opts?: Omit<ApiFetchOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),

  post: <T = any>(path: string, body?: any, opts?: Omit<ApiFetchOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "POST", body }),

  put: <T = any>(path: string, body?: any, opts?: Omit<ApiFetchOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "PUT", body }), // “update”

  patch: <T = any>(path: string, body?: any, opts?: Omit<ApiFetchOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "PATCH", body }),

  del: <T = any>(path: string, opts?: Omit<ApiFetchOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
};
