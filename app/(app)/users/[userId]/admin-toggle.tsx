"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/button";
import { api } from "@/lib/api";

export default function AdminToggle({
  userId,
  initialIsAdmin,
}: {
  userId: string;
  initialIsAdmin: boolean;
}) {
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function onToggle() {
    setErr("");
    setSaving(true);

    const next = !isAdmin;

    try {
      const resp = await api.patch(`/api/users/${encodeURIComponent(userId)}/admin`, {
        isAdmin: next,
      });

      if (!resp?.ok) {
        setErr(resp?.error || "Save failed");
        return;
      }

      setIsAdmin(!!resp?.user?.isAdmin);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  const buttonColor = isAdmin ? "red" : "green";

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        color={buttonColor}
        disabled={saving}
        onClick={onToggle}
      >
        {saving ? "Saving..." : isAdmin ? "Remove admin role" : "Make admin"}
      </Button>

      {err ? <span className="text-xs text-red-400">{err}</span> : null}
    </div>
  );
}