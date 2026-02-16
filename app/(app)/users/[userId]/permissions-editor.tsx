"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import { api } from "@/lib/api";

function normalizeList(raw: string) {
  return Array.from(
    new Set(
      raw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

export default function PermissionsEditor({
  userId,
  initialRoles,
  initialPermissions,
}: {
  userId: string;
  initialRoles: string[];
  initialPermissions: string[];
}) {
  const [rolesText, setRolesText] = useState((initialRoles || []).join("\n"));
  const [permsText, setPermsText] = useState((initialPermissions || []).join("\n"));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const roles = useMemo(() => normalizeList(rolesText), [rolesText]);
  const permissions = useMemo(() => normalizeList(permsText), [permsText]);

  async function save() {
    setSaving(true);
    setMsg(null);

    try {
      const resp = await api.patch(`/api/users/${encodeURIComponent(userId)}/access`, {
        roles,
        permissions,
      });

      if (!resp?.ok) {
        setMsg(resp?.error || "Failed to save");
        return;
      }

      setMsg("Saved");
    } catch (e: any) {
      setMsg(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs text-gray-400 mb-1">Roles (one per line)</div>
        <textarea
          className="w-full rounded-lg border bg-transparent p-2 text-sm min-h-[72px]"
          value={rolesText}
          onChange={(e) => setRolesText(e.target.value)}
          placeholder={`admin\nops\neditor`}
        />
      </div>

      <div>
        <div className="text-xs text-gray-400 mb-1">Permissions (one per line)</div>
        <textarea
          className="w-full rounded-lg border bg-transparent p-2 text-sm min-h-[120px]"
          value={permsText}
          onChange={(e) => setPermsText(e.target.value)}
          placeholder={`users:grant:any\njobs:delete:any\njobs:delete:own`}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save access"}
        </Button>
        {msg ? <div className="text-xs text-gray-400">{msg}</div> : null}
      </div>
    </div>
  );
}