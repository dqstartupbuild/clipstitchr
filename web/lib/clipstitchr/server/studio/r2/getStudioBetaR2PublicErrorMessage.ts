const studioBetaR2PublicErrors = new Set([
  "Choose a supported Studio file type.",
  "Choose an active Product for this Studio file.",
  "Missing R2 object key.",
  "That file format is not supported here.",
  "That file is too large for this Studio upload.",
  "That Studio file is outside this account.",
  "The Studio record ID is invalid.",
  "The Studio request body is required.",
  "The Studio request body is too large.",
  "The Studio request body must be an object.",
  "The Studio request body must be valid JSON.",
  "The Studio request body must be valid UTF-8 JSON.",
  "Unable to verify this download.",
  "Unable to verify this upload.",
]);

export function getStudioBetaR2PublicErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (!(error instanceof Error)) return fallback;

  return studioBetaR2PublicErrors.has(error.message) ? error.message : fallback;
}
