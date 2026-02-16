export const dynamic = "force-dynamic";

import { Badge } from "@/components/badge";
import { Heading } from "@/components/heading";
import { api } from "@/lib/api";
import { LocalDateTime } from "@/components/local-datetime";
import { RolePill } from "@/components/role-pill";

type UserRow = {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  roles?: string[];
};

export default async function UsersPage() {
  const data = await api.get("/api/users?limit=50");
  const users: UserRow[] = data?.users || [];

  return (
    <main className="font-sans">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 pb-6 border-zinc-950/10 dark:border-white/10">
        <Heading>Users</Heading>
        <div className="flex gap-4">
          {/* optional later */}
          {/* <Button color="pink" href="/users/new">+ Create User</Button> */}
        </div>
      </div>

      {!data?.ok && (
        <pre className="mt-6 rounded-xl border p-4 text-sm">{JSON.stringify(data, null, 2)}</pre>
      )}

      <div className="overflow-hidden rounded-xl border">
        <div className="grid grid-cols-12 gap-0 px-3 py-3 font-bold text-gray-200 text-sm">
          <div className="col-span-4">Name</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Created</div>
        </div>

        {users.length === 0 ? (
          <div className="px-3 py-6 text-sm text-gray-600">No users yet.</div>
        ) : (
          users.map((u) => {
            const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "(No name)";
            return (
              <a
                key={u.userId}
                href={`/users/${encodeURIComponent(u.userId)}`}
                className="grid grid-cols-12 gap-0 px-3 py-3 text-sm border-t hover:bg-white/5"
              >
                <div className="col-span-4 font-semibold text-xs pt-1">{fullName}</div>
                <div className="col-span-4 text-gray-200 text-xs pt-1">{u.email}</div>
                <div className="col-span-2">
                  <RolePill roles={u.roles} />
                </div>
                <div className="col-span-2 text-gray-500">
                  <LocalDateTime value={u.createdAt} />
                </div>
              </a>
            );
          })
        )}
      </div>
    </main>
  );
}
