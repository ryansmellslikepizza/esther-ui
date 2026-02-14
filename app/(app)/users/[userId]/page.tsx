import { Heading } from "@/components/heading";
import { Badge } from "@/components/badge";
import { api } from "@/lib/api";
import AdminToggle from "./admin-toggle";

function AdminPill({ isAdmin }: { isAdmin?: boolean }) {
  return <Badge color={(isAdmin ? "green" : "zinc") as any}>{isAdmin ? "Admin" : "User"}</Badge>;
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const [data, me] = await Promise.all([
    api.get(`/api/users/${encodeURIComponent(userId)}`, { cache: "no-store" }),
    api.get(`/api/me`, { cache: "no-store" }),
  ]);

  const u = data?.user;
  const meUserId = me?.user?.userId || "";

  const fullName = `${u?.firstName || ""} ${u?.lastName || ""}`.trim() || "(No name)";
  const canEditAdmin = meUserId != u?.userId;

  return (
    <main className="font-sans max-w-3xl">
      <a className="text-sm text-blue-600 hover:underline mb-3 inline-block" href="/users">
        ← Back
      </a>

      <div className="flex items-center justify-between gap-4">
        <Heading>{fullName}</Heading>
        {canEditAdmin ? (
            <AdminToggle userId={u.userId} initialIsAdmin={!!u.isAdmin} />
          ) : null}
      </div>

      {!data?.ok && (
        <pre className="mt-6 rounded-xl border p-4 text-sm">{JSON.stringify(data, null, 2)}</pre>
      )}

      {data?.ok && (
        <div className="mt-6 overflow-hidden rounded-xl border">
          <div className="grid grid-cols-12 gap-0 px-3 py-3 text-sm border-b font-semibold text-gray-200">
            <div className="col-span-4">Field</div>
            <div className="col-span-8">Value</div>
          </div>

          <Row label="User ID" value={u?.userId || "-"} />
          <Row
            label="Role"
            value={
              <div className="flex items-center gap-3">
                <AdminPill isAdmin={u.isAdmin} />
              </div>
            }
          />
          <Row label="Email" value={u?.email || "-"} />
          <Row label="First name" value={u?.firstName || "-"} />
          <Row label="Last name" value={u?.lastName || "-"} />
          <Row label="Age" value={u?.age || "-"} />
          <Row label="Created" value={u?.createdAt ? new Date(u.createdAt).toLocaleString() : "-"} />
          <Row label="Updated" value={u?.updatedAt ? new Date(u.updatedAt).toLocaleString() : "-"} />
        </div>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="grid grid-cols-12 gap-0 px-3 py-3 text-sm border-t">
      <div className="col-span-4 text-gray-400">{label}</div>
      <div className="col-span-8 text-gray-200 break-all">{value}</div>
    </div>
  );
}