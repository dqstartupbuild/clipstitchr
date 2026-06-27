export function parsePostBridgeSocialAccountIds(value: string) {
  const parsedValue = JSON.parse(value) as unknown;

  if (!Array.isArray(parsedValue)) {
    throw new Error("Choose connected accounts before scheduling.");
  }

  const ids = parsedValue
    .map((item) => (typeof item === "number" ? item : Number.NaN))
    .filter((item) => Number.isFinite(item));

  return [...new Set(ids)];
}
