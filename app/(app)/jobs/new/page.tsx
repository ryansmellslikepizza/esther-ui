"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Description, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Button } from '@/components/button'
import { getSessionUser } from "@/lib/session";

type UploadResp =
  | {
      ok: true;
      jobId: string;
      captureId: string;
      isTest: boolean;
      receivedKeys: string[];
      uploaded: Record<string, string>;
      jobInputs: Record<string, string>;
      normalization: { started: boolean; pid?: number };
      promptId?: string | null;
      scanMode?: "quick" | "full";
    }
  | { ok: false; error: string; [k: string]: any };

type PromptListItem = {
  promptId: string;
  key: string;
  name?: string;
  version?: number | null;
  isActive?: boolean;
  isDeleted?: boolean;
};

type DropZoneProps = {
  label: string; // field key (e.g. white_center)
  help?: string;
  file: File | null;
  setFile: (f: File | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

function makeDefaultCaptureId() {
  return `capture_${uuidv4()}`;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function pickFirstImageFile(dt: DataTransfer | null): File | null {
  if (!dt) return null;
  const files = Array.from(dt.files || []);
  return files.find((f) => f.type?.startsWith("image/")) || null;
}

function DropZone2({ label, help, file, setFile, inputRef }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <div className="text-sm text-gray-400 mb-2">
        Select a{" "}
        <span className="font-mono text-yellow-400">
          <b>{label}</b>
        </span>{" "}
        image{help ? <span className="text-gray-500"> — {help}</span> : null}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
          const f = pickFirstImageFile(e.dataTransfer);
          if (f) setFile(f);
        }}
        className={[
          "rounded-xl border-2 border-dashed p-5 cursor-pointer select-none",
          "transition-colors",
          dragging ? "border-indigo-500" : "border-gray-300 hover:border-gray-400",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">{file ? "File selected" : "Drag & drop an image here"}</div>
            <div className="text-xs text-gray-500 mt-1">
              {file ? `${file.name} • ${formatBytes(file.size)}` : "or click to browse (PNG/JPG/WEBP)"}
            </div>
          </div>

          {file ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        id={label}
        name={label}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
    </div>
  );
}

function DropZone({ label, help, file, setFile, inputRef }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create / cleanup object URL for preview
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div>
      <div className="text-sm text-gray-400 mb-2">
        Select a{" "}
        <span className="font-mono text-yellow-400">
          <b>{label}</b>
        </span>{" "}
        image{help ? <span className="text-gray-500"> — {help}</span> : null}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
          const f = pickFirstImageFile(e.dataTransfer);
          if (f) setFile(f);
        }}
        className={[
          "rounded-xl border-2 border-dashed p-5 cursor-pointer select-none",
          "transition-colors",
          dragging ? "border-indigo-500" : "border-gray-300 hover:border-gray-400",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">
              {file ? "File selected" : "Drag & drop an image here"}
            </div>
            <div className="text-xs text-gray-500 mt-1 truncate">
              {file ? `${file.name} • ${formatBytes(file.size)}` : "or click to browse (PNG/JPG/WEBP)"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Preview thumbnail */}
            {previewUrl ? (
              <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                <img
                  src={previewUrl}
                  alt={`${label} preview`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            {file ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="rounded-lg border px-3 py-1.5 text-xs hover:border-pink-500 pointer"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        id={label}
        name={label}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
    </div>
  );
}

export default function NewJobPage() {
  const router = useRouter();

  const [captureId, setCaptureId] = useState(makeDefaultCaptureId());
  const [firstName, setFirstName] = useState("");
  const [userId, setUserId] = useState("");
  const [isTest, setIsTest] = useState(true);

  // ✅ scan mode toggle
  const [isFullScan, setIsFullScan] = useState(false);

  // quick (always required)
  const [whiteCenter, setWhiteCenter] = useState<File | null>(null);
  const [uvCenter, setUvCenter] = useState<File | null>(null);

  // full scan extras
  const [whiteYawLeft, setWhiteYawLeft] = useState<File | null>(null);
  const [uvYawLeft, setUvYawLeft] = useState<File | null>(null);
  const [whiteYawRight, setWhiteYawRight] = useState<File | null>(null);
  const [uvYawRight, setUvYawRight] = useState<File | null>(null);

  const whiteCenterRef = useRef<HTMLInputElement | null>(null);
  const uvCenterRef = useRef<HTMLInputElement | null>(null);

  const whiteYawLeftRef = useRef<HTMLInputElement | null>(null);
  const uvYawLeftRef = useRef<HTMLInputElement | null>(null);
  const whiteYawRightRef = useRef<HTMLInputElement | null>(null);
  const uvYawRightRef = useRef<HTMLInputElement | null>(null);

  // ✅ prompts
  const [prompts, setPrompts] = useState<PromptListItem[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsError, setPromptsError] = useState<string>("");

  // ✅ selected promptId (optional)
  const [promptId, setPromptId] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<UploadResp | null>(null);

  // Fetch prompts on mount
  useEffect(() => {
    let cancelled = false;

    const user = getSessionUser();
    setFirstName(user?.firstName)
    setUserId(user?.userId)
    
    async function loadPrompts() {
      setPromptsLoading(true);
      setPromptsError("");
      try {
        const res = await fetch("/api/prompts?activeOnly=false&limit=200", { cache: "no-store" });
        const data = await res.json().catch(() => null);

        if (!res.ok) throw new Error(data?.error || `Failed to load prompts (HTTP ${res.status})`);

        const items: PromptListItem[] = Array.isArray(data?.prompts) ? data.prompts : [];
        const list = items.filter((p) => p && !p.isDeleted);

        list.sort(
          (a, b) => (a.key || "").localeCompare(b.key || "") || (a.name || "").localeCompare(b.name || "")
        );

        if (!cancelled) {
          setPrompts(list);

          if (!promptId) {
            const preferred = list.find((p) => p.key === "visible_uv_report") || list[0];
            if (preferred?.promptId) setPromptId(preferred.promptId);
          } else if (list.length > 0 && !list.some((p) => p.promptId === promptId)) {
            const preferred = list.find((p) => p.key === "visible_uv_report") || list[0];
            if (preferred?.promptId) setPromptId(preferred.promptId);
          }
        }
      } catch (e: any) {
        if (!cancelled) setPromptsError(e?.message || String(e));
      } finally {
        if (!cancelled) setPromptsLoading(false);
      }
    }

    loadPrompts();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If they toggle OFF full scan, clear the 4 extra files so we never “mix”
  useEffect(() => {

    if (!isFullScan) {
      setWhiteYawLeft(null);
      setUvYawLeft(null);
      setWhiteYawRight(null);
      setUvYawRight(null);
      if (whiteYawLeftRef.current) whiteYawLeftRef.current.value = "";
      if (uvYawLeftRef.current) uvYawLeftRef.current.value = "";
      if (whiteYawRightRef.current) whiteYawRightRef.current.value = "";
      if (uvYawRightRef.current) uvYawRightRef.current.value = "";
    }
  }, [isFullScan]);

  const scanMode = isFullScan ? "full" : "quick";

  const canSubmit = useMemo(() => {
    if (!captureId.trim()) return false;
    if (submitting) return false;

    // quick always required
    if (!whiteCenter || !uvCenter) return false;

    // if full scan, require all 6
    if (isFullScan) {
      if (!whiteYawLeft || !uvYawLeft || !whiteYawRight || !uvYawRight) return false;
    }

    return true;
  }, [
    captureId,
    submitting,
    isFullScan,
    whiteCenter,
    uvCenter,
    whiteYawLeft,
    uvYawLeft,
    whiteYawRight,
    uvYawRight,
  ]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    if (!captureId.trim()) return setResult({ ok: false, error: "capture_id is required" });
    if (!userId.trim()) return setResult({ ok: false, error: "user_id is required" });
    if (!whiteCenter) return setResult({ ok: false, error: "white_center image is required" });
    if (!uvCenter) return setResult({ ok: false, error: "uv_center image is required" });

    if (isFullScan) {
      if (!whiteYawLeft) return setResult({ ok: false, error: "white_yaw_left image is required for full scan" });
      if (!uvYawLeft) return setResult({ ok: false, error: "uv_yaw_left image is required for full scan" });
      if (!whiteYawRight) return setResult({ ok: false, error: "white_yaw_right image is required for full scan" });
      if (!uvYawRight) return setResult({ ok: false, error: "uv_yaw_right image is required for full scan" });
    }

    const fd = new FormData();
    fd.append("capture_id", captureId.trim());
    fd.append("user_id", userId.trim());
    fd.append("is_test", isTest ? "true" : "false");

    // optional scan hint (backend can also infer from received keys)
    fd.append("scan_mode", scanMode);

    // quick
    fd.append("white_center", whiteCenter);
    fd.append("uv_center", uvCenter);

    // full extras
    if (isFullScan) {
      fd.append("white_yaw_left", whiteYawLeft!);
      fd.append("uv_yaw_left", uvYawLeft!);
      fd.append("white_yaw_right", whiteYawRight!);
      fd.append("uv_yaw_right", uvYawRight!);
    }

    // optional prompt override
    if (promptId) fd.append("prompt_id", promptId);

    setSubmitting(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data: UploadResp = await res.json();
      setResult(data);

      if ((data as any)?.ok && (data as any)?.jobId) {
        router.push(`/jobs`);
      }
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  function resetAll() {
    setCaptureId(makeDefaultCaptureId());
    setWhiteCenter(null);
    setUvCenter(null);
    if (whiteCenterRef.current) whiteCenterRef.current.value = "";
    if (uvCenterRef.current) uvCenterRef.current.value = "";

    setIsFullScan(false); // triggers clearing the extra 4 via effect

    setResult(null);
  }

  return (
    <main className="font-sans max-w-3xl">
      <a className="text-sm text-blue-600 hover:underline" href="/jobs">
        ← Back
      </a>

      <h1 className="mt-3 text-2xl font-bold">Create Job</h1>
      <p className="mt-2 text-gray-600">
        Choose a scan mode and upload the required images. Quick scan = 2 images. Full scan = 6 images.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-6">
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold">Job Info</div>

          <div className="mt-3 grid gap-3">
            <Field>
              <Label>capture_id</Label>
              <Input value={captureId} disabled />
            </Field>

            <Field>
              <Label>created_by</Label>
              <Input value={firstName} disabled />
            </Field>

            {/* Prompt selector */}
            <Field>
              <Label>Prompt</Label>
              <Description>Choose which prompt document to use (optional override).</Description>

              <div className="flex items-center gap-3">
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={promptId}
                  onChange={(e) => setPromptId(e.target.value)}
                  disabled={promptsLoading || prompts.length === 0}
                >
                  {prompts.length === 0 ? (
                    <option value="">
                      {promptsLoading
                        ? "Loading prompts..."
                        : "No prompts found (server default will be used)"}
                    </option>
                  ) : (
                    prompts.map((p) => (
                      <option key={p.promptId} value={p.promptId}>
                        {p.key} — {p.name || "(no name)"}
                        {typeof p.version === "number" ? ` (v${p.version})` : ""}
                        {p.isActive ? " ★" : ""}
                      </option>
                    ))
                  )}
                </select>

                <button
                  type="button"
                  className="rounded-lg border px-3 py-2 text-sm pointer hover:border-pink-500"
                  onClick={async () => {
                    setPromptsLoading(true);
                    setPromptsError("");
                    try {
                      const res = await fetch("/api/prompts?activeOnly=false&limit=200", { cache: "no-store" });
                      const data = await res.json().catch(() => null);
                      if (!res.ok) throw new Error(data?.error || `Failed to load prompts (HTTP ${res.status})`);

                      const items: PromptListItem[] = Array.isArray(data?.prompts) ? data.prompts : [];
                      const list = items.filter((p) => p && !p.isDeleted);
                      list.sort(
                        (a, b) =>
                          (a.key || "").localeCompare(b.key || "") ||
                          (a.name || "").localeCompare(b.name || "")
                      );
                      setPrompts(list);

                      if (list.length > 0 && !list.some((p) => p.promptId === promptId)) {
                        const preferred = list.find((p) => p.key === "visible_uv_report") || list[0];
                        if (preferred?.promptId) setPromptId(preferred.promptId);
                      }
                    } catch (e: any) {
                      setPromptsError(e?.message || String(e));
                    } finally {
                      setPromptsLoading(false);
                    }
                  }}
                >
                  Refresh
                </button>
              </div>

              {promptsError ? <div className="text-sm text-red-600 mt-2">{promptsError}</div> : null}
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isTest} onChange={(e) => setIsTest(e.target.checked)} />
              is_test
            </label>
          </div>
        </div>

           {/* Scan mode toggle */}
            <div className="rounded-lg border p-3">
              <div className="text-sm font-semibold">Scan Mode</div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <input
                  id="fullscan"
                  type="checkbox"
                  checked={isFullScan}
                  onChange={(e) => setIsFullScan(e.target.checked)}
                />
                <label htmlFor="fullscan">
                  Full / 3D scan (6 images).{" "}
                  <span className="text-gray-500">Uncheck for Quick scan (2 images).</span>
                </label>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Current: <span className="font-mono">{scanMode}</span>
              </div>
            </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold">Images</div>

          <div className="mt-3 text-xs text-gray-500">
            Required fields for <span className="font-mono">{scanMode}</span>:{" "}
            {isFullScan
              ? "white_center, uv_center, white_yaw_left, uv_yaw_left, white_yaw_right, uv_yaw_right"
              : "white_center, uv_center"}
          </div>

          <div className="mt-4 grid gap-6">
            <DropZone
              label="white_center"
              help="center, visible / white-light"
              file={whiteCenter}
              setFile={setWhiteCenter}
              inputRef={whiteCenterRef}
            />

            <DropZone
              label="uv_center"
              help="center, UV / 365nm"
              file={uvCenter}
              setFile={setUvCenter}
              inputRef={uvCenterRef}
            />

            {isFullScan ? (
              <>
                <DropZone
                  label="white_yaw_left"
                  help="yaw left, visible / white-light"
                  file={whiteYawLeft}
                  setFile={setWhiteYawLeft}
                  inputRef={whiteYawLeftRef}
                />

                <DropZone
                  label="uv_yaw_left"
                  help="yaw left, UV / 365nm"
                  file={uvYawLeft}
                  setFile={setUvYawLeft}
                  inputRef={uvYawLeftRef}
                />

                <DropZone
                  label="white_yaw_right"
                  help="yaw right, visible / white-light"
                  file={whiteYawRight}
                  setFile={setWhiteYawRight}
                  inputRef={whiteYawRightRef}
                />

                <DropZone
                  label="uv_yaw_right"
                  help="yaw right, UV / 365nm"
                  file={uvYawRight}
                  setFile={setUvYawRight}
                  inputRef={uvYawRightRef}
                />
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? "Uploading..." : "Create Job"}
          </button>

          <button type="button" className="rounded-lg border px-4 py-2 text-sm hover:border-pink-500 pointer" onClick={resetAll}>
            Reset
          </button>
        </div>

        {result ? (
          <div className="rounded-xl border p-4">
            <div className="text-sm font-semibold">Response</div>
            <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        ) : null}
      </form>
    </main>
  );
}
