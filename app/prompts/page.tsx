"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Heading } from '@/components/heading'

type PromptListItem = {
  promptId: string;
  key: string;
  name: string;
  description?: string;
  version?: number | null;
  model?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function PromptsPage() {
  const [rows, setRows] = useState<PromptListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [keyFilter, setKeyFilter] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [limit, setLimit] = useState("200");

  const apiBase = useMemo(() => {
    // If Node API is separate, set NEXT_PUBLIC_API_BASE_URL in .env.local
    return process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";
  }, []);

  function buildUrl() {
    const params = new URLSearchParams();
    params.set("limit", String(Math.min(Math.max(parseInt(limit || "200", 10) || 200, 1), 500)));
    if (keyFilter.trim()) params.set("key", keyFilter.trim());
    if (activeOnly) params.set("activeOnly", "true");
    if (includeDeleted) params.set("includeDeleted", "true");
    return `${apiBase}/api/prompts?${params.toString()}`;
  }

  async function load() {
    setLoading(true);
    setError("");

    try {
      const url = buildUrl();
      const res = await fetch(url, { method: "GET" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || `Request failed (HTTP ${res.status})`);
        setRows([]);
        return;
      }

      setRows(Array.isArray(data?.prompts) ? data.prompts : []);
    } catch (e: any) {
      setError(e?.message || String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="font-sans">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border- border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Prompts</Heading>
        <div className="flex gap-0">
          <Button color="pink" href="/prompts/new">+ Create Prompt</Button>
        </div>
      </div>

      {/* Filters */}
      {/* <div
        className="mt-6"
        style={{
          padding: 14,
          border: "1px solid #eee",
          borderRadius: 14,
          display: "grid",
          gap: 12,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 700 }}>Key filter</label>
            <input
              value={keyFilter}
              onChange={(e) => setKeyFilter(e.target.value)}
              placeholder="e.g. visible_uv_report"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 700 }}>Limit</label>
            <input value={limit} onChange={(e) => setLimit(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <label style={checkLabelStyle}>
            <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
            Active only
          </label>

          <label style={checkLabelStyle}>
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
            />
            Include deleted
          </label>

          <button onClick={load} disabled={loading} style={buttonStyle}>
            {loading ? "Loading..." : "Refresh"}
          </button>

          <div style={{ color: "#666", fontSize: 13 }}>
            Showing <b>{rows.length}</b> prompts
          </div>
        </div>

        {error ? (
          <div style={{ background: "#ffe8e8", border: "1px solid #ffb3b3", padding: 12, borderRadius: 10 }}>
            <b style={{ color: "#a40000" }}>Error:</b> {error}
          </div>
        ) : null}
      </div> */}

      {/* Table */}
      <div style={{ marginTop: 0, border: "1px solid #eee", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
            <tr style={{ background: "#" }}>
            <Th>Key</Th>
            <Th>Name</Th>
            <Th>Version</Th>
            <Th>Model</Th>
            <Th>Status</Th>
            <Th>Updated</Th>
            <Th>Actions</Th>
            </tr>
        </thead>

        <tbody>
            {rows.length === 0 ? (
            <tr>
                <td colSpan={7} style={{ padding: 16, color: "#666" }}>
                {loading ? "Loading..." : "No prompts found."}
                </td>
            </tr>
            ) : (
            rows.map((p) => (
                <tr key={p.promptId} style={{ borderTop: "1px solid #eee" }}>
                <Td>
                    <div style={{ fontWeight: 800 }}>{p.key || "-"}</div>
                    <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{p.promptId}</div>
                </Td>

                <Td>
                  <div className="mt-2">
                    <div style={{ fontWeight: 700 }}>{p.name || "-"}</div>
                    {p.description ? (
                    <div style={{ color: "#666", fontSize: 13 }}>{p.description}</div>
                    ) : null}
                  </div>
                </Td>

                <Td>
                  <div className="mt-2">
                    {p.version ?? "-"}
                  </div>
                </Td>
                <Td>
                  <div className="mt-2">
                  {p.model ?? "-"}
                  </div>
                </Td>

                <Td>
                    <div className="mt-2">
                      <StatusPill active={!!p.isActive} deleted={!!p.isDeleted} />
                    </div>
                </Td>

                <Td>
                    <div>{fmtDate(p.updatedAt)}</div>
                    <div style={{ color: "#666", fontSize: 12 }}>
                    created {fmtDate(p.createdAt)}
                    </div>
                </Td>

                <Td>
                    <Button 
                    className="mt-0.5"
                    href={`/prompts/${encodeURIComponent(p.promptId)}`}
                    color="blue">View</Button>
                </Td>
                </tr>
            ))
            )}
        </tbody>
        </table>

      </div>
    </main>
  );
}

function StatusPill({ active, deleted }: { active: boolean; deleted: boolean }) {
  const label = deleted ? "deleted" : active ? "active" : "inactive";
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border";
  const s = (status || "unknown").toLowerCase();
  const color = deleted ? "red" : active ? "green" : "zinc";

  let cls = "zinc";
  if (s.includes("fail")) cls = "red";
  else if (s.includes("analy")) cls = "blue";
  else if (s.includes("normal")) cls = "purple";
  else if (s.includes("done") || s.includes("complete")) cls = "green";
  else if (s.includes("upload")) cls = "yellow";

  return <Badge color={color as any}>{label}</Badge>;
}

function fmtDate(s?: string | null) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

function Th({ children }: { children: any }) {
  return (
    <th style={{ textAlign: "left", padding: "12px 12px", borderBottom: "1px solid #eee", fontWeight: 900 }}>
      {children}
    </th>
  );
}

function Td({ children }: { children: any }) {
  return <td style={{ padding: "12px 12px", verticalAlign: "top" }}>{children}</td>;
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 12,
  fontSize: 14,
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const checkLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 700,
};
