function parseApifyNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));

    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  return 0;
}

export function getApifyNumber(
  record: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const parsed = parseApifyNumber(record[key]);

    if (parsed > 0) {
      return parsed;
    }
  }

  return 0;
}
