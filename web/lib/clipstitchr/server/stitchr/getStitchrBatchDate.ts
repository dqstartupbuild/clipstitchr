export function getStitchrBatchDate(now: string) {
  const timestamp = Date.parse(now);

  if (!Number.isFinite(timestamp)) {
    throw new Error("Stitchr batch date requires a valid timestamp.");
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}
