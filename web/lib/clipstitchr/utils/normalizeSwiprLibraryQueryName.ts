const SWIPR_LIBRARY_QUERY_MAX_LENGTH = 120;

export function normalizeSwiprLibraryQueryName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, SWIPR_LIBRARY_QUERY_MAX_LENGTH);
}
