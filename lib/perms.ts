export function hasPerm(perms: string[] | undefined | null, perm: string) {
  if (!Array.isArray(perms)) return false;
  if (perms.includes("*")) return true;
  return perms.includes(perm);
}