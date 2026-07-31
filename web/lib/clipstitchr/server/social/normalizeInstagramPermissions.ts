export function normalizeInstagramPermissions(
  permissions: string | string[] | undefined,
) {
  const values = Array.isArray(permissions)
    ? permissions
    : (permissions ?? "").split(",");

  return values.map((value) => value.trim()).filter(Boolean);
}
