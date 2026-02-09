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
      <h1 className="text-2xl font-bold">Esther UI</h1>
      <p className="mt-2 text-gray-600">API rewrite check:</p>

      <pre className="mt-4 rounded-xl border p-4 text-sm">
        {JSON.stringify(apiCheck, null, 2)}
      </pre>
    </main>
  );
}
