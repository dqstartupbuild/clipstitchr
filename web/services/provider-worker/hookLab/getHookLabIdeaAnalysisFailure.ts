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

  if (normalized.includes("seconds")) {
    return {
      failureCode: "video_too_long",
      failureMessage: "That video is longer than Hook Lab can analyze right now.",
    };
  }

  if (normalized.includes("does not expose") || normalized.includes("missing")) {
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
