"use client";
export const dynamic = "force-dynamic";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from '@/components/button'
import { LocalDateTime } from "@/components/local-datetime";

type PromptDoc = {
  promptId: string;
  key?: string;
  name?: string;
  description?: string;
  version?: number | null;
  model?: string | null;
  system?: string;
  userTemplate?: string;
  userTemplateFull?: string;
  userTemplateQuick?: string;
  metadata?: any;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function PromptViewerPage({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { promptId } = React.use(params);

  const [prompt, setPrompt] = useState<PromptDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState("");

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "", []);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/api/prompts/${encodeURIComponent(promptId)}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Request failed (HTTP ${res.status})`);
      }

      console.log(data);

      setPrompt(data?.prompt || null);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await load();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, promptId]);

  async function activate() {
    if (!prompt) return;
    setActing(true);
    setActionError("");

    try {
      const res = await fetch(`${apiBase}/api/prompts/${encodeURIComponent(prompt.promptId)}/activate`, {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `Activate failed (HTTP ${res.status})`);

      setPrompt(data?.prompt || prompt);
    } catch (e: any) {
      setActionError(e?.message || String(e));
    } finally {
      setActing(false);
    }
  }

  async function deactivate() {
    if (!prompt) return;
    setActing(true);
    setActionError("");

    try {
      const res = await fetch(`${apiBase}/api/prompts/${encodeURIComponent(prompt.promptId)}/deactivate`, {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `Deactivate failed (HTTP ${res.status})`);

      setPrompt(data?.prompt || prompt);
    } catch (e: any) {
      setActionError(e?.message || String(e));
    } finally {
      setActing(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div>
          <a className="text-sm text-blue-600 hover:underline mb-8" href="/prompts">
            ← Back to Prompts
          </a>
          <br />
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Prompt Viewer</h1>
          <p style={{ marginTop: 6, color: "#666" }}>
            <code>{promptId}</code>
          </p>
        </div>

        {/* Actions */}
        {/* {!loading && !error && prompt && !prompt.isDeleted ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {!prompt.isActive ? (
              <Button type="button" onClick={activate} disabled={acting || !prompt.key} color="green">
                {acting ? "Setting active..." : "Set as active"}
              </Button>
            ) : (
              <Button type="button" onClick={deactivate} disabled={acting} color="red">
                {acting ? "Deactivating..." : "Deactivate"}
              </Button>
            )}
          </div>
        ) : null} */}
      </div>

      {actionError ? (
        <div style={{ ...cardStyle, background: "#ffe8e8", borderColor: "#ffb3b3" }}>
          <b style={{ color: "#a40000" }}>Action error:</b> {actionError}
        </div>
      ) : null}

      {loading ? (
        <div style={cardStyle}>Loading…</div>
      ) : error ? (
        <div style={{ ...cardStyle, background: "#ffe8e8", borderColor: "#ffb3b3" }}>
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
              <Info label="Created" value={<LocalDateTime value={prompt.createdAt} />} />
            </div>

            {prompt.description ? (
              <div style={{ marginTop: 12, color: "#444" }}>
                <b>Description:</b> {prompt.description}
              </div>
            ) : null}

            {!prompt.key ? (
              <div style={{ marginTop: 12, color: "#a40000", fontWeight: 800 }}>
                This prompt has no <code>key</code>, so it can’t be activated.
              </div>
            ) : null}
          </div>

          <Section title="System Prompt" text={prompt.system || ""} />
          <Section title="User Template (Quick scan) - 2 images" text={prompt.userTemplateQuick || ""} />
          <Section title="User Template (Full / 3D scan) - 6 images" text={prompt.userTemplateFull || ""} />

          <div style={cardStyle}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Metadata</div>
            <pre style={preStyle}>{JSON.stringify(prompt.metadata ?? {}, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
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
      style={ghostBtn}
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function fmtDate(s?: string | null) {
  if (!s) return "-";
  return <LocalDateTime value={s} />
}

const cardStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 14,
  border: "1px solid #eee",
  // background: "#fff",
};

const preStyle: React.CSSProperties = {
  marginTop: 10,
  padding: 20,
  borderRadius: 12,
  // border: "1px solid #eee",
  // background: "#fafafa",
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  fontSize: 13,
  lineHeight: 1.4,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const primaryBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111",
  background: "#111",
  // color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const dangerBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #a40000",
  background: "#a40000",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid #ddd",
  // background: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};
