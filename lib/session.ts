export type SessionUser = {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
};

const KEY = "session_user";

export function setSessionUser(u: SessionUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(u));
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSessionUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
