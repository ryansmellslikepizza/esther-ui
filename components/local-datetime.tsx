"use client";

/**
 * LocalDateTime
 *
 * This component formats ISO date strings on the CLIENT instead of the server.
 *
 * Why this exists:
 * - Server Components run in the server's timezone (often UTC in production).
 * - If we call `toLocaleString()` on the server, it formats using the server timezone,
 *   not the viewer's timezone.
 * - By marking this as `"use client"`, the formatting runs in the browser,
 *   so `toLocaleString()` uses the end user's local timezone.
 *
 * Result:
 * - Timestamps stored in UTC in the database
 * - Displayed correctly in the viewer's local time
 */
export function LocalDateTime({ value }: { value?: string | null }) {
  if (!value) return <>-</>;
  return <>{new Date(value).toLocaleString()}</>;
}
