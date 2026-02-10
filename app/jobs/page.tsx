
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Heading } from '@/components/heading'

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

  let cls = "zinc";
  if (s.includes("fail")) cls = "red";
  else if (s.includes("analy")) cls = "blue";
  else if (s.includes("normal")) cls = "purple";
  else if (s.includes("done") || s.includes("complete")) cls = "green";
  else if (s.includes("upload")) cls = "yellow";

  return <Badge color={cls}>{status}</Badge>;
}

export default async function JobsPage() {
  const res = await fetch("http://localhost:3001/api/jobs?limit=50", { cache: "no-store" });
  const data = await res.json();

  const jobs: JobRow[] = data?.jobs || [];

  return (
    <main className="font-sans">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Jobs</Heading>
        <div className="flex gap-4">
          <Button color="pink" href="/jobs/new">+ Create Job</Button>
        </div>
      </div>

      {!data?.ok && (
        <pre className="mt-6 rounded-xl border p-4 text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border">
        <div className="grid grid-cols-12 gap-0 px-4 py-3 text-xs font-semibold text-gray-600">
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
              className="grid grid-cols-12 gap-0 px-4 py-3 text-sm border-t"
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
