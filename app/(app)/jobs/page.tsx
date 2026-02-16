export const dynamic = "force-dynamic";

import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Heading } from '@/components/heading'
import { api } from "@/lib/api";
import { LocalDateTime } from "@/components/local-datetime";
import { capitalize } from "@/lib/helpers";

type JobRow = {
  jobId: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  inputs: string[];
  eventsCount: number;
  error: any;
  creator: any;
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

  return <Badge color={cls as any}>{capitalize(status)}</Badge>;
}

function ScanTypePill({ length }: { length: number }) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border";
  let cls = "pink";
  let text = "";
  
  if (length == 2) {
    cls = "purple"
    text = "Quick Scan"
  } else if (length == 6) {
    cls = "green"
    text = "Full 3D Scan"
  }

  return <Badge color={cls as any}>{text}</Badge>;
}

export default async function JobsPage() {
  const res = await api.get("/api/jobs?limit=50", { cache: "no-store" });
  const data = await res;

  const jobs: JobRow[] = data?.jobs || [];

  return (
    <main className="font-sans">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border- border-zinc-950/10 pb-6 dark:border-white/10">
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

      <div className="overflow-hidden rounded-xl border">
        <div className="grid grid-cols-12 gap-0 px-3 py-3 font-bold text-gray-200 text-sm">
          <div className="col-span-4">Job</div>
          <div className="col-span-2">Created By</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Scan Type</div>
          <div className="col-span-2">Created</div>
          {/* <div className="col-span-2">Events</div> */}
        </div>

        {jobs.length === 0 ? (
          <div className="px-3 py-6 text-sm text-gray-600">No jobs yet.</div>
        ) : (
          jobs.map((j) => (
            <a
              key={j.jobId}
              href={`/jobs/${encodeURIComponent(j.jobId)}`}
              className="grid grid-cols-12 gap-0 px-3 py-3 text-sm border-t"
            >
              <div className="col-span-4 font-semibold text-xs pt-1">{j.jobId}</div>
              <div className="col-span-2 text-yellow-500 font-semibold text-xs pt-1">{j.creator.firstName}</div>
              <div className="col-span-2"><StatusPill status={j.status} /></div>
              <div className="col-span-2 text-gray-500 text-xs"><ScanTypePill length={j.inputs.length} /></div>
              <div className="col-span-2 text-gray-500">
                <LocalDateTime value={j.createdAt} />
              </div>
              {/* <div className="col-span-2 text-gray-500">{j.eventsCount ?? 0}</div> */}
            </a>
          ))
        )}
      </div>
    </main>
  );
}
