export default async function JobDetail({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  const res = await fetch(
    `http://localhost:3001/api/jobs/${encodeURIComponent(jobId)}`,
    { cache: "no-store" }
  );
  const data = await res.json();

  if (!data?.ok) {
    return (
      <main className="p-8 font-sans">
        <a className="text-sm text-blue-600 hover:underline" href="/jobs">
          ← Back
        </a>
        <pre className="mt-6 rounded-xl border p-4 text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </main>
    );
  }

  const job = data.job;
  const inputsAssets = job?.assets?.inputs || {};
  const inputTypes = Object.keys(inputsAssets);

  // Helper: convert an original file URL to its thumbnail URL
  const toThumbUrl = (src: string) => {
    // src looks like: /outputs/<jobId>/<filename>
    // we want:        /outputs/<jobId>/thumbs/<filename>
    const parts = src.split("/");
    const filename = parts[parts.length - 1];
    return `/outputs/${jobId}/thumbs/${filename}`;
  };

  return (
    <main className="font-sans">
      <a className="text-sm text-blue-600 hover:underline" href="/jobs">
        ← Back
      </a>

      <h1 className="mt-3 text-2xl font-bold">{job.jobId}</h1>
      <p className="mt-2 text-gray-400">Status: {job.status || "unknown"}</p>

      <div className="mt-6 grid gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold">Input</div>
          {inputTypes.length === 0 ? (
            <div className="mt-2 text-sm text-gray-500">No image assets found.</div>
          ) : (
            <div
                className="mt-3 grid gap-3"
                style={{ gridTemplateColumns: "repeat(auto-fill, 100px)" }}
              >
              {inputTypes.map((type) => {
                const asset = inputsAssets[type] || {};
                const thumb = asset.thumb; // keep if you still want it
                const files: string[] = asset.files || [];
                // console.log(asset)
                return (
                  <div key={type} className="overflow-hidden rounded bg-black/5">
                    <div className="flex items-baseline justify-between">
                      <div className="text-sm font-semibold">{type}</div>
                    </div>
                    {thumb ? (
                      <div className="mt-3">
                        <a href={thumb.replace("/thumbs/", "/")} target="_blank" rel="noreferrer">
                          <img
                            className="thumbnail rounded border max-w-[220px]"
                            src={thumb}
                            alt={`${type} thumbnail`}
                            loading="lazy"
                          />
                        </a>
                      </div>
                    ) : null}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>


      <div className="mt-6 grid gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold">Normalization</div>

          {inputTypes.length === 0 ? (
            <div className="mt-2 text-sm text-gray-500">No image assets found.</div>
          ) : (
            <div className="mt-4 grid gap-6">
              {inputTypes.map((type) => {
                const asset = inputsAssets[type] || {};
                const thumb = asset.thumb; // keep if you still want it
                const files: string[] = asset.files || [];
                console.log(asset)
                return (
                  <div key={type} className="rounded-lg border p-3">
                    <div className="flex items-baseline justify-between">
                      <div className="text-sm font-semibold">{type}</div>
                      <div className="text-xs text-gray-500">{files.length} file(s)</div>
                    </div>

                    {/* Optional thumbnail (already a thumbs url from API) */}
                    {thumb || false ? (
                      <div className="mt-3 hide">
                        <div className="text-xs text-gray-500 mb-1">Thumbnail</div>
                        <a href={thumb.replace("/thumbs/", "/")} target="_blank" rel="noreferrer">
                          <img
                            className="thumbnail rounded border max-w-[220px]"
                            src={thumb}
                            alt={`${type} thumbnail`}
                            loading="lazy"
                          />
                        </a>
                      </div>
                    ) : null}

                    {/* All files for this input type (render THUMB versions) */}
                    <div
                        className="mt-3 grid gap-3"
                        style={{ gridTemplateColumns: "repeat(auto-fill, 100px)" }}
                      >
                      {files.map((src) => {
                        const thumbSrc = toThumbUrl(src);

                        return (
                          <a key={src} href={src} target="_blank" rel="noreferrer">
                            <div className="w-[100px] h-[100px] overflow-hidden rounded border bg-black/5">
                              <img
                                src={thumbSrc}
                                alt={`${type} ${src}`}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </a>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* <h2>Data</h2> */}
 <div className="mt-6 grid gap-4">
  <div className="rounded-xl border p-4 hide">
    <div className="text-sm font-semibold">Inputs</div>
    <pre className="mt-2 text-xs">{JSON.stringify(job.inputs || {}, null, 2)}</pre>
  </div>

  {/* ✅ NEW: Analysis */}
  <div className="rounded-xl border p-4">
    <div className="text-sm font-semibold">Analysis</div>

    <div className="mt-6">
      <p className="mt-2 text-gray-600">Status: {job.status || "unknown"}</p>

      {job.status === "analysis_done" && (
          <a className="text-blue-600 hover:underline" href={`/jobs/${jobId}/report`}>
            View Image Analysis Report
          </a>
      )}
          
    </div>

    {job.analysis ? (
      <div className="mt-3 grid gap-4">
        {/* Summary */}
        <div className="grid gap-1 text-sm">
                {job?.analysis?.promptId ? (
              <div className="text-sm">
                <span className="text-gray-500">prompt used:</span>{" "}
                <a
                  className="text-blue-600 hover:underline font-mono"
                  href={`/admin/prompts/${encodeURIComponent(job.analysis.promptId)}`}
                >
                  {job.analysis.promptId}
                </a>
                {job?.analysis?.promptKey ? (
                  <span className="text-gray-500"> ({job.analysis.promptKey})</span>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-gray-500">prompt: -</div>
            )}
          <div>
            <span className="text-gray-500">startedAt:</span>{" "}
            <span className="font-mono">{job.analysis.startedAt || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">finishedAt:</span>{" "}
            <span className="font-mono">{job.analysis.finishedAt || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">outPath:</span>{" "}
            <span className="font-mono break-all">{job.analysis.outPath || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">requestBytes:</span>{" "}
            <span className="font-mono">{job.analysis.openaiRequestBytes ?? "-"}</span>
          </div>
        </div>

        {/* Image URLs (clickable) */}
        {Array.isArray(job.analysis.imageUrls) && job.analysis.imageUrls.length > 0 ? (
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2">Image URLs (click to verify)</div>
            <div className="grid gap-2">
              {job.analysis.imageUrls.map((img: any, idx: number) => (
                <div key={`${img?.label || "img"}-${idx}`} className="text-sm">
                  <div className="font-mono text-xs text-gray-600">
                    {img?.label || `image_${idx + 1}`} {img?.modality ? `(${img.modality})` : ""}
                  </div>
                  {img?.url ? (
                    <a
                      className="text-blue-600 hover:underline break-all"
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {img.url}
                    </a>
                  ) : (
                    <div className="text-gray-500 text-xs">(missing url)</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No analysis.imageUrls found.</div>
        )}

        {/* OpenAI Request Snapshot */}
        {job.analysis.openaiRequest ? (
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2">OpenAI Request Snapshot</div>

            <div className="grid gap-1 text-sm">
              <div>
                <span className="text-gray-500">endpoint:</span>{" "}
                <span className="font-mono break-all">{job.analysis.openaiRequest.endpoint || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">model:</span>{" "}
                <span className="font-mono">{job.analysis.openaiRequest.model || "-"}</span>
              </div>


            </div>

            <pre className="mt-3 text-xs rounded-lg border p-3 bg-black/[0.02] overflow-auto">
              {JSON.stringify(job.analysis.openaiRequest, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No analysis.openaiRequest found.</div>
        )}

        {job.analysis ? (
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2">Analysis Data Dump</div>
            <pre className="mt-3 text-xs rounded-lg border p-3 bg-black/[0.02] overflow-auto">
              {JSON.stringify(job.analysis, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No analysis found.</div>
        )}
      </div>
    ) : (
      <div className="mt-2 text-sm text-gray-500">No analysis data yet.</div>
    )}
  </div>

  {/* Events */}
  <div className="rounded-xl border p-4">
    <div className="text-sm font-semibold">Events</div>
    <pre className="mt-2 text-xs">{JSON.stringify(job.events || [], null, 2)}</pre>
  </div>

  <div className="rounded-xl border p-4">
    <div className="text-sm font-semibold">Error</div>
    <pre className="mt-2 text-xs">{JSON.stringify(job.error || null, null, 2)}</pre>
  </div>
</div>

    </main>
  );
}
