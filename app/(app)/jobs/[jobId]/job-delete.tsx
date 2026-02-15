"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { api } from "@/lib/api";

export default function JobDelete({
  jobId,
  redirectTo = "/jobs",
}: {
  jobId: string;
  redirectTo?: string;
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function onDelete() {
    setErr("");

    const ok = window.confirm("Delete this job? This cannot be undone.");
    if (!ok) return;

    setSaving(true);
    try {
      const resp = await api.del(`/api/jobs/${encodeURIComponent(jobId)}`);

      if (!resp?.ok) {
        setErr(resp?.error || "Delete failed");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" color="red" disabled={saving} onClick={onDelete}>
        {saving ? "Deleting..." : "Delete"}
      </Button>

      {err ? <span className="text-xs text-red-400">{err}</span> : null}
    </div>
  );
}