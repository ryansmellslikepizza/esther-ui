
import { Heading } from '@/components/heading'

export default async function Home() {
  let apiCheck: any = null;

  try {
    const res = await fetch("http://localhost:3001/api/health", { cache: "no-store" });
    apiCheck = await res.json();
  } catch (e: any) {
    apiCheck = { ok: false, error: e?.message || String(e) };
  }

  return (
    <main className="font-sans">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border- border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Ester AI</Heading>
      </div>
      <p className=" text-gray-600">API health check:</p>
      <pre className="mt-4 rounded-xl p-4 text-sm">
        {JSON.stringify(apiCheck, null, 2)}
      </pre>
    </main>
  );
}
