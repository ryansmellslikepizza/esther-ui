export default async function JobReport({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  const res = await fetch(
    `http://localhost:3001/outputs/${jobId}/report.md`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return (
      <main className="">
        <a
          href={`/jobs/${jobId}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back
        </a>
        <p className="mt-4 text-red-600">Report not found</p>
      </main>
    );
  }

  const text = await res.text();

  return (
    <main className="">
      <a
        href={`/jobs/${jobId}`}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back
      </a>

      <h1 className="mt-4 text-2xl font-bold">Image Analysis Report</h1>

      <pre className="mt-4 whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-xl">
        {text}
      </pre>
    </main>
  );
}
