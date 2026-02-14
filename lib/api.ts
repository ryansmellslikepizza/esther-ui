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
    : "https://admin.dermis.dev");

// Avoid noisy logs during build/prerender
// console.log("API HOST:", API_HOST);

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiFetchOptions = Omit<RequestInit, "method" | "body"> & {
  method?: ApiMethod;
  body?: any; // object | string | FormData | undefined
};

function isFormData(x: any): x is FormData {
  return typeof FormData !== "undefined" && x instanceof FormData;
}

function isServer() {
  return typeof window === "undefined";
}

/**
 * Server Components / SSR:
 * Next does NOT automatically forward the incoming request cookies to fetch() calls
 * you make to another origin (your Node API). We must forward them manually.
 *
 * This function is safe to call in shared code because it only imports `next/headers`
 * dynamically on the server.
 */
async function getServerCookieHeader(): Promise<string> {
  if (!isServer()) return "";

  try {
    // Dynamic import so this file can still be used in client components safely
    const mod = await import("next/headers");
    const cookieStore = await mod.cookies();

    // Convert cookies -> "a=b; c=d" header format
    const all = cookieStore.getAll();
    if (!all?.length) return "";

    return all.map((c) => `${c.name}=${c.value}`).join("; ");
  } catch {
    // If we're not in a request context (rare), just skip
    return "";
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const url = `${API_HOST}${path.startsWith("/") ? path : `/${path}`}`;

  const method: ApiMethod = (options.method || "GET").toUpperCase() as ApiMethod;

  const hasBody = options.body !== undefined && options.body !== null;
  const body =
    hasBody && typeof options.body === "object" && !isFormData(options.body)
      ? JSON.stringify(options.body)
      : (options.body as any);

  const shouldSetJsonContentType =
    hasBody && typeof body === "string" && !isFormData(options.body);

  // Base headers
  const headers: Record<string, string> = {
    ...(shouldSetJsonContentType ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  // ✅ On the server, forward incoming cookies to your API so httpOnly token is seen
  if (isServer()) {
    const cookieHeader = await getServerCookieHeader();

    // Only set if caller didn't provide their own cookie header
    if (cookieHeader && !("cookie" in (headers as any)) && !("Cookie" in (headers as any))) {
      headers.cookie = cookieHeader;
    }
  }

  const res = await fetch(url, {
    ...options,
    method,
    // Keep this; in the browser it matters; on server it's harmless
    credentials: "include",
    headers,
    body,
  });

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") || "";

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
    apiFetch<T>(path, { ...opts, method: "PUT", body }),

  patch: <T = any>(path: string, body?: any, opts?: Omit<ApiFetchOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "PATCH", body }),

  del: <T = any>(path: string, opts?: Omit<ApiFetchOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
};
