export function getHookLabPostAnalysisFailure(error: unknown) {
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

  if (
    normalized.includes("imported video") ||
    normalized.includes("usable source video") ||
    normalized.includes("apify dataset") ||
    normalized.includes("empty dataset")
  ) {
    return {
      failureCode: "source_video_unavailable",
      failureMessage:
        "That public post did not provide a usable video. Check the link and try again.",
    };
  }

  if (normalized.includes("instagram") || normalized.includes("tiktok")) {
    return {
      failureCode: "social_import_failed",
      failureMessage:
        "We could not read that public post. Check the link and try again.",
    };
  }

  return {
    failureCode: "analysis_failed",
    failureMessage:
      "We could not finish this post analysis. Try again in a moment.",
  };
}
