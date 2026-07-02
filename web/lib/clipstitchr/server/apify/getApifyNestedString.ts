import { getApifyRecord } from "@/lib/clipstitchr/server/apify/getApifyRecord";

export function getApifyNestedString(
  record: Record<string, unknown>,
  path: string[],
) {
  let current: unknown = record;

  for (const key of path) {
    const currentRecord = getApifyRecord(current);

    if (!currentRecord) {
      return "";
    }

    current = currentRecord[key];
  }

  return typeof current === "string" && current.trim() ? current.trim() : "";
}
