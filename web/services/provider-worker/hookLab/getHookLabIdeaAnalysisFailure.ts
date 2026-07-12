export function getHookLabIdeaAnalysisFailure(error: unknown) {
  const message = error instanceof Error ? error.message : "Analysis failed.";
  const normalized = message.toLowerCase();

  if (normalized.includes("start could not be confirmed")) {
    return {
      failureCode: "social_import_start_unconfirmed",
      failureMessage:
        "We could not confirm that import. Try again when you are ready.",
    };
  }

  if (normalized.includes("video") && normalized.includes("large")) {
    return {
      failureCode: "video_too_large",
      failureMessage: "That video is too large for Hook Lab right now.",
    };
  }

  if (
    normalized.includes("hook lab supports public videos up to") &&
    normalized.includes("seconds")
  ) {
    return {
      failureCode: "video_too_long",
      failureMessage: "That video is longer than Hook Lab can analyze right now.",
    };
  }

  const importedVideoUnavailable =
    (normalized.includes("imported video") &&
      (normalized.includes("download") ||
        normalized.includes("empty") ||
        normalized.includes("expired") ||
        normalized.includes("redirect") ||
        normalized.includes("too long"))) ||
    (normalized.includes("imported link") && normalized.includes("video")) ||
    normalized.includes("imported video duration could not be read") ||
    normalized.includes("missing its apify dataset") ||
    normalized.includes("returned an empty dataset") ||
    normalized.includes("does not expose a usable source video");

  if (importedVideoUnavailable) {
    return {
      failureCode: "source_video_unavailable",
      failureMessage:
        "That post did not share a usable video. Paste the hook text instead.",
    };
  }

  if (normalized.includes("instagram") || normalized.includes("tiktok")) {
    return {
      failureCode: "social_import_failed",
      failureMessage:
        "We could not read that public post. Try again or paste the text instead.",
    };
  }

  return {
    failureCode: "analysis_failed",
    failureMessage:
      "We could not finish learning this idea. Try again in a moment.",
  };
}
