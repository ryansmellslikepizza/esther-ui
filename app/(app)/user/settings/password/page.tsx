"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, Label, Description } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { api } from "@/lib/api";


type MeResp = {
  ok: boolean;
  authenticated?: boolean;
  user?: { email?: string; name?: string; userId?: string; isAdmin?: boolean };
  error?: string;
};

type UpdateMeBody = {
  email?: string;
  name?: string;
  currentPassword?: string;
  newPassword?: string;
};

type UpdateMeResp = {
  ok: boolean;
  user?: { email?: string; name?: string; userId?: string; isAdmin?: boolean };
  error?: string;
};

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [loadingMe, setLoadingMe] = useState(true);
  const [error, setError] = useState<string>("");
  const [saved, setSaved] = useState<any>(null);

  // Prefill from server (expects GET /api/me to exist and use cookie auth)
  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<MeResp>("/api/me");
        if (me?.ok && (me as any).user) {
          setEmail(me.user?.email || "");
          setName(me.user?.name || "");
        }
      } catch (e: any) {
        // If you haven't implemented GET /api/me yet, you can ignore this.
        // Otherwise this will show errors when not logged in.
        // setError(e?.message || String(e));
      } finally {
        setLoadingMe(false);
      }
    })();
  }, []);

  const wantsPasswordChange = useMemo(() => {
    return (
      !!currentPassword.trim() || !!newPassword.trim() || !!confirmNewPassword.trim()
    );
  }, [currentPassword, newPassword, confirmNewPassword]);

  const canSubmit = useMemo(() => {
    const wantsEmail = !!email.trim();
    const wantsName = !!name.trim();

    // if (!wantsEmail && !wantsName && !wantsPasswordChange) return false;

    if (wantsPasswordChange) {
      if (!currentPassword.trim()) return false;
      if (!newPassword.trim()) return false;
      if (newPassword.trim().length < 3) return false;
      if (newPassword !== confirmNewPassword) return false;
    }

    return true;
  }, [email, name, wantsPasswordChange, currentPassword, newPassword, confirmNewPassword]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(null);

    const body: UpdateMeBody = {};

    if (email.trim()) body.email = email.trim();
    if (name.trim()) body.name = name.trim();

    if (wantsPasswordChange) {
      if (!currentPassword.trim()) {
        setError("Current password is required to change your password.");
        return;
      }
      if (!newPassword.trim()) {
        setError("New password is required.");
        return;
      }
      if (newPassword.trim().length < 8) {
        setError("New password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("New passwords do not match.");
        return;
      }

      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    setSaving(true);
    try {
      // PATCH /api/me (cookie-based auth)
      const data = await api.patch<UpdateMeResp>("/api/me", body);

      if (!data?.ok) {
        setError(data?.error || "Save failed");
        return;
      }

      setSaved(data?.user || data);

      // Clear password fields after a successful save
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="font-sans max-w-3xl">
      <a className="text-sm text-blue-600 hover:underline mb-3" href="/user/settings">
        ← Back to main Settings
      </a>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Change Password</h1>
      
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }} autoComplete="off">   
      <div
          style={{
            display: "grid",
            gap: 20,
          }}
        >
        <div>
            
        <small style={{ color: "#666" }}>
          Tip: To change your password, you must provide your current password and enter the new one
          twice.
        </small>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <Field>
              <Label>Current password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword((e.target as HTMLInputElement).value)}
                autoComplete="off"
                style={monoStyle}
              />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <Field>
                <Label>New password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)}
                  autoComplete="new-password"
                  style={monoStyle}
                />
              </Field>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <Field>
                <Label>Confirm new password</Label>
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword((e.target as HTMLInputElement).value)}
                  autoComplete="new-password"
                  style={monoStyle}
                />
              </Field>
            </div>
          </div>
        </div>

        {error ? (
          <div
            style={{
              background: "",
              border: "1px solid #ffb3b3",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <strong style={{ color: "#a40000" }}>Error:</strong> <span>{error}</span>
          </div>
        ) : null}

        {saved ? (
          <div
            style={{
              background: "",
              border: "1px solid #b9f2c8",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <strong>Saved:</strong>
            <pre className="p-3 rounded-2xl" style={{ margin: "8px 0 0", whiteSpace: "pre-wrap" }}>
              {JSON.stringify(saved, null, 2)}
            </pre>
          </div>
        ) : null}

               <Button
            className="mt-5"
          color="pink"
          type="submit"
          disabled={!canSubmit || saving || loadingMe}
        >
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}

const monoStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #111",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};
