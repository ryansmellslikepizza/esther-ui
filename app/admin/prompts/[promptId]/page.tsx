"use client";
import React from "react";
import { useEffect, useMemo, useState } from "react";

type PromptDoc = {
  promptId: string;
  key?: string;
  name?: string;
  description?: string;
  version?: number | null;
  model?: string | null;
  system?: string;
  userTemplate?: string;
  metadata?: any;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function PromptViewerPage({ params }: { params: { promptId: string } }) {
  const { promptId } = React.use(params);

  const [prompt, setPrompt] = useState<PromptDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "", []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        console.log('calll..')
        const res = await fetch(`${apiBase}/api/prompts/${encodeURIComponent(promptId)}`);
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.error || `Request failed (HTTP ${res.status})`);
        }

        if (!cancelled) setPrompt(data?.prompt || null);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [apiBase, promptId]);

  return (
    <div >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div>
          <a className="text-sm text-blue-600 hover:underline mb-8" href="/admin/prompts">
            ← Back to Prompts
          </a>
          <br />
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>
            Prompt Viewer
          </h1>
          <p style={{ marginTop: 6, color: "#666" }}>
            <code>{promptId}</code>
          </p>
        </div>
      </div>

      {loading ? (
        <div style={cardStyle}>Loading…</div>
      ) : error ? (
        <div style={{ ...cardStyle, background: "#", borderColor: "#ffb3b3" }}>
          <b style={{ color: "#a40000" }}>Error:</b> {error}
        </div>
      ) : !prompt ? (
        <div style={cardStyle}>Not found.</div>
      ) : (
        <>
          <div style={cardStyle}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Info label="Key" value={prompt.key || "-"} />
              <Info label="Name" value={prompt.name || "-"} />
              <Info label="Model" value={prompt.model || "-"} />
              <Info label="Version" value={String(prompt.version ?? "-")} />
              <Info label="Status" value={prompt.isDeleted ? "deleted" : prompt.isActive ? "active" : "inactive"} />
              <Info label="Updated" value={fmtDate(prompt.updatedAt)} />
            </div>

            {prompt.description ? (
              <div style={{ marginTop: 12, color: "#444" }}>
                <b>Description:</b> {prompt.description}
              </div>
            ) : null}
          </div>

          <Section title="System Prompt" text={prompt.system || ""} />

          <Section title="User Template" text={prompt.userTemplate || ""} />

          <div style={cardStyle}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Metadata</div>
            <pre style={preStyle}>{JSON.stringify(prompt.metadata ?? {}, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "#666", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <CopyButton text={text} />
      </div>

      <pre style={preStyle}>{text || "(empty)"}</pre>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text || "");
          setCopied(true);
          setTimeout(() => setCopied(false), 900);
        } catch {}
      }}
      style={{
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid #ddd",
        background: "#",
        fontWeight: 800,
        cursor: "pointer",
      }}
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function fmtDate(s?: string | null) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

const cardStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 14,
  border: "1px solid #eee",
  background: "#",
};

const preStyle: React.CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: 12,
  border: "1px solid #eee",
  background: "#",
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  fontSize: 13,
  lineHeight: 1.4,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const linkButtonStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  fontWeight: 800,
  textDecoration: "none",
};
