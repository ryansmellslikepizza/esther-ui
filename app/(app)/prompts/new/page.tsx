"use client";

import { useMemo, useState } from "react";
import { Description, Field, Label } from "@/components/fieldset";
import { Textarea } from "@/components/textarea";
import { Input } from "@/components/input";

type CreatePromptBody = {
  key: string;
  name?: string;
  description?: string;
  version?: number;
  model?: string;

  system: string;
  userTemplateQuick?: string;
  userTemplateFull?: string;

  isActive?: boolean;
  metadata?: Record<string, any>;
};

export default function NewPromptPage() {
  const [key, setKey] = useState("visible_uv_report");
  const [name, setName] = useState("Visible + UV Skin Report v1");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState<string>("1");
  const [model] = useState("gpt-5.2");

  const [system, setSystem] = useState("");
  const [userTemplateQuick, setUserTemplateQuick] = useState("");
  const [userTemplateFull, setUserTemplateFull] = useState("");

  const [isActive, setIsActive] = useState(true);
  const [metadataJson, setMetadataJson] = useState<string>('{"tags":["skin analysis","report"]}');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [created, setCreated] = useState<any>(null);

  const canSubmit = useMemo(() => {
    const k = key.trim();
    if (!k) return false;

    // ✅ for the new schema: system is required
    if (!system.trim()) return false;

    // ✅ require at least one of the templates
    if (!userTemplateQuick.trim() && !userTemplateFull.trim()) return false;

    return true;
  }, [key, system, userTemplateQuick, userTemplateFull]);

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
      userTemplateQuick: userTemplateQuick || "",
      userTemplateFull: userTemplateFull || "",

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
      <a className="text-sm text-blue-600 hover:underline mb-3" href="/prompts">
        ← Back
      </a>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create Prompt</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: 24 }}>
        Creates a prompt in Mongo via <code>POST /api/prompts</code>.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <Field>
            <Label>Key *</Label>
            <Description>Stable identifier your runtime uses to fetch the active prompt.</Description>
            <Input value={key} onChange={(e) => setKey(e.target.value)} style={textareaStyle} />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <Field>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} style={textareaStyle} />
            </Field>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <Field>
              <Label>Model</Label>
              <Input value={model} disabled style={textareaStyle} />
            </Field>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <Field>
              <Label>Version (optional)</Label>
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1"
                style={textareaStyle}
              />
            </Field>
          </div>

          <div style={{ display: "grid", gap: 6, alignContent: "end" }}>
            <label style={{ fontWeight: 600 }}>Activate immediately</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span>Set as active for this key</span>
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <Field>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional note for the admin panel"
              style={textareaStyle}
            />
          </Field>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <Field>
            <Label>System Prompt *</Label>
            <Textarea
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              placeholder="Paste the system prompt here..."
              rows={14}
              style={textareaStyle}
            />
          </Field>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <Field>
            <Label>User Template (Quick scan) - 2 images</Label>
            <Description>
              Used when upload set is exactly: <code>white_center</code> + <code>uv_center</code>.
            </Description>
            <Textarea
              value={userTemplateQuick}
              onChange={(e) => setUserTemplateQuick(e.target.value)}
              placeholder='Example: "Here are the two photos... Produce the report now."'
              rows={8}
              style={textareaStyle}
            />
          </Field>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <Field>
            <Label>User Template (Full / 3D scan) - 6 images</Label>
            <Description>
              Used when upload set includes center + yaw left + yaw right (visible + UV).
            </Description>
            <Textarea
              value={userTemplateFull}
              onChange={(e) => setUserTemplateFull(e.target.value)}
              placeholder='Example: "Here are the six photos... Produce the report now."'
              rows={8}
              style={textareaStyle}
            />
          </Field>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <Field>
            <Label>Metadata (JSON, optional)</Label>
            <Textarea
              value={metadataJson}
              onChange={(e) => setMetadataJson(e.target.value)}
              placeholder='{"tags":["visia","report"]}'
              rows={4}
              style={textareaStyle}
            />
          </Field>
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

        <button className="bg-pink-500 mt-5" type="submit" disabled={!canSubmit || saving} style={buttonStyle}>
          {saving ? "Saving..." : "Create Prompt"}
        </button>

        <small style={{ color: "#666" }}>
          *Validation: requires <code>key</code>, <code>system</code>, and at least one of{" "}
          <code>userTemplateQuick</code> / <code>userTemplateFull</code>.
        </small>
      </form>
    </div>
  );
}

const textareaStyle: React.CSSProperties = {
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
