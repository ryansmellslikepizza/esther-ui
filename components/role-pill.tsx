import { Badge } from "@/components/badge";
import { capitalize } from "@/lib/helpers";

export function RolePill({ roles }: { roles?: string[] }) {
  const r = Array.isArray(roles) ? roles : [];

  if (r.includes("super")) {
    return <Badge color={"green" as any}>Super</Badge>;
  }

  if (r.length > 0) {
    return (
      <Badge color={"blue" as any}>
        {r.map(capitalize).join(", ")}
      </Badge>
    );
  }

  return <Badge color={"zinc" as any}>User</Badge>;
}