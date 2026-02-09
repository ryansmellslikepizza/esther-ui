"use client";

import { useMemo, useState } from "react";

type CreatePromptBody = {
  key: string;
  name?: string;
  description?: string;
  version?: number;
  model?: string;
  system?: string;
  userTemplate?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
};

export default function NewPromptPage() {
  const [key, setKey] = useState("visible_uv_report");
    const [name, setName] = useState("Visible + UV Skin Report v1");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState<string>("1");
  const [model, setModel] = useState("gpt-5.2");
  const [system, setSystem] = useState("");
  const [userTemplate, setUserTemplate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [metadataJson, setMetadataJson] = useState<string>('{"tags":["skin analysis","report"]}');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [created, setCreated] = useState<any>(null);

  const canSubmit = useMemo(() => {
    const k = key.trim();
    if (!k) return false;
    if (!system.trim() && !userTemplate.trim()) return false;
    return true;
  }, [key, system, userTemplate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreated(null);

    const body: CreatePromptBody = {
      key: key.trim(),
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      model: model.trim() || undefined,
      system: system || "",
      userTemplate: userTemplate || "",
      isActive,
    };

    // version (optional)
    const v = Number(version);
    if (!Number.isNaN(v) && Number.isFinite(v)) body.version = v;

    // metadata (optional)
    if (metadataJson.trim()) {
      try {
        body.metadata = JSON.parse(metadataJson);
      } catch (err: any) {
        setError(`metadata must be valid JSON: ${err?.message || err}`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error || `Request failed (HTTP ${res.status})`;
        setError(msg);
        return;
      }

      setCreated(data?.prompt || data);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <a className="text-sm text-blue-600 hover:underline mb-3" href="/admin/prompts">
        ← Back
      </a>
      
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create Prompt</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: 24 }}>
        Creates a prompt in Mongo via <code>POST /api/prompts</code>.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>Key *</label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="visia_report"
            style={inputStyle}
          />
          <small style={{ color: "#666" }}>
            Stable identifier your runtime uses to fetch the active prompt.
          </small>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Model</label>
            <input value={model} onChange={(e) => setModel(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Version (optional)</label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gap: 6, alignContent: "end" }}>
            <label style={{ fontWeight: 600 }}>Activate immediately</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span style={{ color: "#333" }}>Set as active for this key</span>
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional note for the admin panel"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>System Prompt *</label>
          <textarea
            value={system}
            onChange={(e) => setSystem(e.target.value)}
            placeholder="Paste the system prompt here..."
            style={textareaStyle}
            rows={14}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>User Template (optional)</label>
          <textarea
            value={userTemplate}
            onChange={(e) => setUserTemplate(e.target.value)}
            placeholder='Optional. Example: "Image list:\n{{imageIndexLines}}"'
            style={textareaStyle}
            rows={8}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>Metadata (JSON, optional)</label>
          <textarea
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
            placeholder='{"tags":["visia","report"]}'
            style={textareaStyle}
            rows={4}
          />
        </div>

        {error ? (
          <div style={{ background: "#ffe8e8", border: "1px solid #ffb3b3", padding: 12, borderRadius: 8 }}>
            <strong style={{ color: "#a40000" }}>Error:</strong> <span>{error}</span>
          </div>
        ) : null}

        {created ? (
          <div style={{ background: "#ecfff1", border: "1px solid #b9f2c8", padding: 12, borderRadius: 8 }}>
            <strong>Created:</strong>
            <pre style={{ margin: "8px 0 0", whiteSpace: "pre-wrap" }}>
              {JSON.stringify(created, null, 2)}
            </pre>
          </div>
        ) : null}

        <button className="bg-indigo-500" type="submit" disabled={!canSubmit || saving} style={buttonStyle}>
          {saving ? "Saving..." : "Create Prompt"}
        </button>

        <small style={{ color: "#666" }}>
          *Validation: requires <code>key</code> and at least one of <code>system</code> or <code>userTemplate</code>.
        </small>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 10,
  fontSize: 14,
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #111",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};
