export default function NotAdminPage({ searchParams }: { searchParams?: { next?: string } }) {
  const next = searchParams?.next || "/";

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
        Admin access required
      </h1>

      <p style={{ color: "#666", marginBottom: 18 }}>
        You need to be an admin to view this page.
      </p>

      <a href={next} style={{ color: "#2563eb", textDecoration: "underline" }}>
        Go back
      </a>
    </div>
  );
}
