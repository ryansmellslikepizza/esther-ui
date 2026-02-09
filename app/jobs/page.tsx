type JobRow = {
  jobId: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  inputs: string[];
  eventsCount: number;
  error: any;
};

function StatusPill({ status }: { status: string }) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border";
  const s = (status || "unknown").toLowerCase();

  let cls = "border-gray-300 text-gray-700 bg-white";
  if (s.includes("fail")) cls = "border-red-300 text-red-700 bg-red-50";
  else if (s.includes("analy")) cls = "border-blue-300 text-blue-700 bg-blue-50";
  else if (s.includes("normal")) cls = "border-purple-300 text-purple-700 bg-purple-50";
  else if (s.includes("done") || s.includes("complete")) cls = "border-green-300 text-green-700 bg-green-50";
  else if (s.includes("upload")) cls = "border-yellow-300 text-yellow-800 bg-yellow-50";

  return <span className={`${base} ${cls}`}>{status}</span>;
}

export default async function JobsPage() {
  const res = await fetch("http://localhost:3001/api/jobs?limit=50", { cache: "no-store" });
  const data = await res.json();

  const jobs: JobRow[] = data?.jobs || [];

  return (
    <main className="p-8 font-sans">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="mt-2 text-gray-600">Latest jobs from Mongo</p>
        </div>
        <a className="text-sm text-blue-600 hover:underline" href="/">
          Home
        </a>
      </div>

      {!data?.ok && (
        <pre className="mt-6 rounded-xl border p-4 text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border">
        <div className="grid grid-cols-12 gap-0 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">
          <div className="col-span-4">Job</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Inputs</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-2">Events</div>
        </div>

        {jobs.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-600">No jobs yet.</div>
        ) : (
          jobs.map((j) => (
            <a
              key={j.jobId}
              href={`/jobs/${encodeURIComponent(j.jobId)}`}
              className="grid grid-cols-12 gap-0 px-4 py-3 text-sm hover:bg-gray-50 border-t"
            >
              <div className="col-span-4 font-semibold">{j.jobId}</div>
              <div className="col-span-2"><StatusPill status={j.status} /></div>
              <div className="col-span-2 text-gray-700">{(j.inputs || []).join(", ") || "-"}</div>
              <div className="col-span-2 text-gray-700">{j.updatedAt ? new Date(j.updatedAt).toLocaleString() : "-"}</div>
              <div className="col-span-2 text-gray-700">{j.eventsCount ?? 0}</div>
            </a>
          ))
        )}
      </div>
    </main>
  );
}
