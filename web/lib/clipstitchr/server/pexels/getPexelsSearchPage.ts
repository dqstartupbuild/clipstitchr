const DEFAULT_PEXELS_PAGE = 1;
const MAX_PEXELS_PAGE = 80;

export function getPexelsSearchPage(value: unknown) {
  const page = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(page)) {
    return DEFAULT_PEXELS_PAGE;
  }

  return Math.min(MAX_PEXELS_PAGE, Math.max(1, Math.floor(page)));
}
