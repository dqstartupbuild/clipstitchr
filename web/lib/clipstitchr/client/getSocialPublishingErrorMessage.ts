const NETWORK_ERROR_MESSAGE =
  "ClipStitchr could not reach the server. Check your connection and try again.";

export function getSocialPublishingErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.trim();

  if (
    /^(load failed|failed to fetch|network request failed|networkerror when attempting to fetch resource\.?)/i.test(
      message,
    )
  ) {
    return NETWORK_ERROR_MESSAGE;
  }

  return message || fallback;
}
