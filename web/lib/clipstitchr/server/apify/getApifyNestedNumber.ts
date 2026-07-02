import { getApifyRecord } from "@/lib/clipstitchr/server/apify/getApifyRecord";

function parseApifyNestedNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));

    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  return 0;
}

export function getApifyNestedNumber(
  record: Record<string, unknown>,
  path: string[],
) {
  let current: unknown = record;

  for (const key of path) {
    const currentRecord = getApifyRecord(current);

    if (!currentRecord) {
      return 0;
    }

    current = currentRecord[key];
  }

  return parseApifyNestedNumber(current);
}
