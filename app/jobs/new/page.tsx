"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

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
    }
  | { ok: false; error: string; [k: string]: any };

function makeDefaultCaptureId() {
  return `capture_${uuidv4()}`;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function NewJobPage() {
  const router = useRouter();

  const [captureId, setCaptureId] = useState(makeDefaultCaptureId());
  const [isTest, setIsTest] = useState(true);

  const [whiteCenter, setWhiteCenter] = useState<File | null>(null);
  const [uvCenter, setUvCenter] = useState<File | null>(null);

  const [whiteDragging, setWhiteDragging] = useState(false);
  const [uvDragging, setUvDragging] = useState(false);

  const whiteInputRef = useRef<HTMLInputElement | null>(null);
  const uvInputRef = useRef<HTMLInputElement | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<UploadResp | null>(null);

  const canSubmit = useMemo(() => {
    return !!captureId.trim() && !!whiteCenter && !!uvCenter && !submitting;
  }, [captureId, whiteCenter, uvCenter, submitting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    if (!captureId.trim()) {
      setResult({ ok: false, error: "capture_id is required" });
      return;
    }
    if (!whiteCenter) {
      setResult({ ok: false, error: "white_center image is required" });
      return;
    }
    if (!uvCenter) {
      setResult({ ok: false, error: "uv_center image is required" });
      return;
    }

    const fd = new FormData();
    fd.append("capture_id", captureId.trim());
    fd.append("is_test", isTest ? "true" : "false");
    fd.append("white_center", whiteCenter);
    fd.append("uv_center", uvCenter);

    setSubmitting(true);
    try {
      const url = "/api/upload";

      const res = await fetch(url, {
        method: "POST",
        body: fd,
      });

      const data: UploadResp = await res.json();
      setResult(data);

      if ((data as any)?.ok && (data as any)?.jobId) {
        // router.push(`/jobs/${encodeURIComponent((data as any).jobId)}`);
        router.push(`/jobs`);
      }
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  function pickFirstImageFile(dt: DataTransfer | null): File | null {
    if (!dt) return null;
    const files = Array.from(dt.files || []);
    const img = files.find((f) => f.type?.startsWith("image/"));
    return img || null;
  }

  return (
    <main className="font-sans max-w-3xl">
      <a className="text-sm text-blue-600 hover:underline" href="/jobs">
        ← Back
      </a>

      <h1 className="mt-3 text-2xl font-bold">Create Job</h1>
      <p className="mt-2 text-gray-600">
        Upload required images to create a job (currently: white_center + uv_center).
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-6">
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold">Job Info</div>

          <div className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm text-gray-400">capture_id</span>
              <input
                className="rounded-lg border px-3 py-2 text-sm bg-gray-50"
                value={captureId}
                disabled
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isTest}
                onChange={(e) => setIsTest(e.target.checked)}
              />
              is_test
            </label>
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold">Images (required)</div>

          <div className="mt-4 grid gap-6">
            {/* ------------------------------ */}
            {/* WHITE CENTER DROP ZONE */}
            {/* ------------------------------ */}
            <div>
              <div className="text-sm text-gray-400 mb-2">
                Select a <span className="font-mono text-gray-100"><b>white_center</b></span> image.
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => whiteInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") whiteInputRef.current?.click();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setWhiteDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setWhiteDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setWhiteDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setWhiteDragging(false);
                  const f = pickFirstImageFile(e.dataTransfer);
                  if (f) setWhiteCenter(f);
                }}
                className={[
                  "rounded-xl border-2 border-dashed p-5 cursor-pointer select-none",
                  "transition-colors",
                  whiteDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-gray-400",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">
                      {whiteCenter ? "File selected" : "Drag & drop an image here"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {whiteCenter
                        ? `${whiteCenter.name} • ${formatBytes(whiteCenter.size)}`
                        : "or click to browse (PNG/JPG/WEBP)"}
                    </div>
                  </div>

                  {whiteCenter ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWhiteCenter(null);
                        if (whiteInputRef.current) whiteInputRef.current.value = "";
                      }}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              </div>

              <input
                ref={whiteInputRef}
                id="white_center"
                name="white_center"
                type="file"
                accept="image/*"
                required
                className="hidden"
                onChange={(e) => setWhiteCenter(e.target.files?.[0] || null)}
              />
            </div>

            {/* ------------------------------ */}
            {/* UV CENTER DROP ZONE */}
            {/* ------------------------------ */}
            <div>
              <div className="text-sm text-gray-400 mb-2">
                Select a <span className="font-mono text-gray-100"><b>uv_center</b></span> image.
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => uvInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") uvInputRef.current?.click();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUvDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUvDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUvDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUvDragging(false);
                  const f = pickFirstImageFile(e.dataTransfer);
                  if (f) setUvCenter(f);
                }}
                className={[
                  "rounded-xl border-2 border-dashed p-5 cursor-pointer select-none",
                  "transition-colors",
                  uvDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-gray-400",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">
                      {uvCenter ? "File selected" : "Drag & drop an image here"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {uvCenter ? `${uvCenter.name} • ${formatBytes(uvCenter.size)}` : "or click to browse (PNG/JPG/WEBP)"}
                    </div>
                  </div>

                  {uvCenter ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUvCenter(null);
                        if (uvInputRef.current) uvInputRef.current.value = "";
                      }}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              </div>

              <input
                ref={uvInputRef}
                id="uv_center"
                name="uv_center"
                type="file"
                accept="image/*"
                required
                className="hidden"
                onChange={(e) => setUvCenter(e.target.files?.[0] || null)}
              />
            </div>
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

          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm"
            onClick={() => {
              setCaptureId(makeDefaultCaptureId());
              setWhiteCenter(null);
              setUvCenter(null);
              if (whiteInputRef.current) whiteInputRef.current.value = "";
              if (uvInputRef.current) uvInputRef.current.value = "";
              setResult(null);
            }}
          >
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
