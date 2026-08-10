export function parseSocialPublishingSocialAccountIds(value: string) {
  const parsedValue = JSON.parse(value) as unknown;

  if (!Array.isArray(parsedValue)) {
    throw new Error("Choose connected accounts before scheduling.");
  }

  const ids = parsedValue
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return [...new Set(ids)];
}
