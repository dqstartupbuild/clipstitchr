const fixedStudioLazyReelPublicErrors = new Set([
  "Add a video description, transcript, supported link, or product.",
  "Choose a full brief, ideas, or hooks.",
  "Choose a niche for this report focus.",
  "Choose a supported LazyReel research job.",
  "Choose an active saved Product first.",
  "Choose one of the available LazyReel workflows.",
  "Choose overview, format, trends, combos, or apps.",
  "Choose Seedance, Kling, Veo, or Higgsfield.",
  "Request body is required.",
  "Research request is too large.",
  "Research request must be valid JSON.",
  "Saved research result is not readable.",
  "Saved research run has no result.",
  "Saved workflow plan is not readable.",
  "Saved workflow run has no result.",
  "Unable to verify this Studio research request.",
  "Use a public TikTok or Instagram post link.",
]);

const boundedFieldError =
  /^[A-Za-z][A-Za-z ]{0,39} (?:is required|is too long|must be an object|must be a whole number from \d+ to \d+)\.$/;

export function getStudioLazyReelPublicErrorMessage(
  error: unknown,
  fallback = "Unable to complete this research job.",
) {
  if (!(error instanceof Error)) return fallback;
  const message = error.message.trim();

  if (
    fixedStudioLazyReelPublicErrors.has(message) ||
    boundedFieldError.test(message)
  ) {
    return message;
  }

  return fallback;
}
