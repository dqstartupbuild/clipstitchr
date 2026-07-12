const NON_RETRYABLE_ERROR_FRAGMENTS = [
  "could not determine the mimetype",
  "does not expose a usable source video",
  "hook lab supports public videos up to",
  "import did not complete",
  "imported link did not return a video",
  "imported video duration could not be read",
  "imported video response was empty",
  "input validation failed",
  "invalid input",
  "mime_type argument",
  "missing its apify dataset",
  "returned an empty dataset",
  "saved hook lab source is not a video",
  "saved hook lab video was empty",
  "saved video is too large for hook lab",
  "social import start could not be confirmed",
  "temporary video url expired",
  "unknown mime type",
  "unprocessable entity",
  "video is too large",
] as const;

export function getHookLabAnalysisErrorIsRetryable(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const normalized = message.trim().toLowerCase();

  return !NON_RETRYABLE_ERROR_FRAGMENTS.some((fragment) =>
    normalized.includes(fragment),
  );
}
