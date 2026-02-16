"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, Label, Description } from "@/components/fieldset";
import { Input } from "@/components/input";
import { api } from "@/lib/api";
import { Button } from "@/components/button";
import { Link } from "@/components/link";
import { getSessionUser, setSessionUser } from "@/lib/session";

type MeResp = {
  ok: boolean;
  authenticated?: boolean;
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    age?: number;
    userId?: string;
    isAdmin?: boolean;
  };
  error?: string;
};

type UpdateMeBody = {
  email?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  currentPassword?: string;
  newPassword?: string;
};

type UpdateMeResp = {
  ok: boolean;
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    age?: number;
    userId?: string;
    isAdmin?: boolean;
  };
  error?: string;
};

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState<number | "">("");

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
          setFirstName(me.user?.firstName || "");
          setLastName(me.user?.lastName || "");
          setAge(typeof me.user?.age === "number" ? me.user.age : "");
        }
      } catch (e: any) {
        setError(e?.message || String(e));
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
    const wantsFirstName = !!firstName.trim();
    const wantsLastName = !!lastName.trim();

    // if (!wantsEmail && !wantsName && !wantsPasswordChange) return false;

    if (wantsPasswordChange) {
      if (!currentPassword.trim()) return false;
      if (!newPassword.trim()) return false;
      if (newPassword.trim().length < 3) return false;
      if (newPassword !== confirmNewPassword) return false;
    }

    // Age is optional, but if present, validate it
    if (age !== "") {
      if (!Number.isFinite(age)) return false;
      if (age < 0 || age > 120) return false;
    }

    return true;
  }, [
    email,
    firstName,
    lastName,
    age,
    wantsPasswordChange,
    currentPassword,
    newPassword,
    confirmNewPassword,
  ]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(null);

    const body: UpdateMeBody = {};

    if (email.trim()) body.email = email.trim();
    if (firstName.trim()) body.firstName = firstName.trim();
    if (lastName.trim()) body.lastName = lastName.trim();
    if (age !== "") body.age = age;

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

      if (data?.user) {
        const current = getSessionUser();
        if (!current) return;

        const updated = {
          ...current,
          email: data?.user?.email ?? current.email ?? "",
          firstName: data?.user?.firstName ?? current.firstName ?? "",
          lastName: data?.user?.lastName ?? current.lastName ?? "",
          age: data?.user?.age ?? (current as any).age ?? undefined,
        };

        setSessionUser(updated as any);
      }

    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  function onAgeChange(v: string) {
    const s = v.trim();
    if (!s) {
      setAge("");
      return;
    }
    const n = Number(s);
    if (!Number.isFinite(n)) return;

    // keep it integer-like; adjust if you want to allow decimals
    const clamped = Math.max(0, Math.min(120, Math.floor(n)));
    setAge(clamped);
  }

  return (
    <div className="font-sans max-w-3xl">
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Settings</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: 24 }}>
        Update your account settings.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }} autoComplete="off">
        <div style={{ display: "grid", gap: 6 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Basic Settings</h2>

          <Field>
            <Label>Email</Label>
            <Input
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
              placeholder="you@domain.com"
              style={monoStyle}
              disabled={loadingMe}
            />
          </Field>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <Field>
            <Label>First Name</Label>
            <Input
              value={firstName}
              autoComplete="off"
              onChange={(e) => setFirstName((e.target as HTMLInputElement).value)}
              placeholder="Your first name"
              style={monoStyle}
              disabled={loadingMe}
            />
          </Field>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <Field>
            <Label>Last Name</Label>
            <Input
              value={lastName}
              autoComplete="off"
              onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
              placeholder="Your last name"
              style={monoStyle}
              disabled={loadingMe}
            />
          </Field>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <Field>
            <Label>Age</Label>
            {/* <Description>Optional. Used for better analysis personalization.</Description> */}
            <Input
              type="number"
              min={0}
              max={120}
              inputMode="numeric"
              value={age === "" ? "" : String(age)}
              autoComplete="off"
              onChange={(e) => onAgeChange((e.target as HTMLInputElement).value)}
              placeholder="e.g. 46"
              style={monoStyle}
              disabled={loadingMe}
            />
          </Field>
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

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 25,
            marginTop: 25,
            display: "grid",
            gap: 16,
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Security</h2>
            <p style={{ marginTop: 6, color: "#666" }}>
              Manage your password and account security.
            </p>
          </div>

          <Link href="/user/settings/password">
            <Button color="zinc" type="button">
              Change password
            </Button>
          </Link>
        </div>
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