"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/button";

export function JobDeleteButton({
  jobId,
  redirectTo = "/jobs",
}: {
  jobId: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setError(null);

    const ok = window.confirm(
      "Delete this job? This cannot be undone."
    );
    if (!ok) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || `Delete failed (${res.status})`);
        }

        router.push(redirectTo);
        router.refresh();
      } catch (e: any) {
        setError(e?.message || "Delete failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button color="red" onClick={onDelete} disabled={isPending}>
        {isPending ? "Deleting…" : "Delete"}
      </Button>

      {error ? (
        <span className="text-sm text-red-500">{error}</span>
      ) : null}
    </div>
  );
}