export const dynamic = "force-dynamic";
import { Heading } from "@/components/heading";
import { Badge } from "@/components/badge";
import { api } from "@/lib/api";
import AdminToggle from "./admin-toggle";
import PermissionsEditor from "./permissions-editor";
import { LocalDateTime } from "@/components/local-datetime";
import { hasPerm } from "@/lib/perms";
import { RolePill } from "@/components/role-pill";

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
  const meUser = me?.user;
  const meUserId = meUser?.userId || "";

  const fullName = `${u?.firstName || ""} ${u?.lastName || ""}`.trim() || "(No name)";
  const canSeeAccessFields = meUser?.canGrantAnyUser || false; // or isSuper || hasPerm(myPerms, "users:grant:any")
  
  return (
    <main className="font-sans">
      <a className="text-sm text-blue-600 hover:underline mb-3 inline-block" href="/users">
        ← Back
      </a>

      <div className="flex items-center justify-between gap-4">
        <Heading>{fullName}</Heading>
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
                <RolePill roles={u?.roles} />
              </div>
            }
          />
          <Row label="Email" value={u?.email || "-"} />
          <Row label="First name" value={u?.firstName || "-"} />
          <Row label="Last name" value={u?.lastName || "-"} />
          <Row label="Age" value={u?.age || "-"} />

          {canSeeAccessFields ? (
            <Row
              label="Permissions"
              value={
                <PermissionsEditor
                  userId={u.userId}
                  initialRoles={u.roles || []}
                  initialPermissions={u.permissions || []}
                />
              }
            />
          ) : (
            <Row
              label="Permissions"
              value={<div className="text-gray-400">Hidden</div>}
            />
          )}

          <Row label="Created" value={u?.createdAt ? <LocalDateTime value={u.createdAt} /> : "-"} />
          <Row label="Updated" value={u?.updatedAt ? <LocalDateTime value={u.updatedAt} /> : "-"} />
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