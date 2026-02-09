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
    <main className="p-8 font-sans">
      <a className="text-sm text-blue-600 hover:underline" href="/jobs">
        ← Back
      </a>

      <h1 className="mt-3 text-2xl font-bold">{job.jobId}</h1>
      <p className="mt-2 text-gray-600">Status: {job.status || "unknown"}</p>

      <div className="mt-6">
        <a className="text-blue-600 hover:underline" href={`/jobs/${jobId}/report`}>
          Image Analysis Report
        </a>
      </div>

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
