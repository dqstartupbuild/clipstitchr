export function readPublishingPostIdSearchParam(
  value: string | string[] | undefined,
) {
  const id = typeof value === "string" ? value.trim() : "";
  return /^[A-Za-z0-9_-]{1,256}$/.test(id) ? id : null;
}
