const DEFAULT_PEXELS_PER_PAGE = 12;
const MAX_PEXELS_PER_PAGE = 24;

export function getPexelsSearchPerPage(value: unknown) {
  const perPage = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(perPage)) {
    return DEFAULT_PEXELS_PER_PAGE;
  }

  return Math.min(
    MAX_PEXELS_PER_PAGE,
    Math.max(1, Math.floor(perPage)),
  );
}
