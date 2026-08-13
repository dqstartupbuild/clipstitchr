export function classifyStudioStitchPublicError(error: unknown): {
  readonly message: string;
  readonly status: 400 | 404 | 409 | 500;
} {
  const message = error instanceof Error ? error.message : "";
  if (/\b(not found|is unavailable|unavailable output)\b/iu.test(message)) {
    return { message: "Studio Stitch item not found.", status: 404 };
  }
  if (
    /\b(revision conflict|idempotency key|already exists|already has|changed after)\b/iu.test(
      message,
    )
  ) {
    return {
      message: "This Studio Stitch item changed. Refresh and try again.",
      status: 409,
    };
  }
  if (
    /\b(invalid|required|must|only generated|missing verified|byte limit|exceeds|accept this)\b/iu.test(
      message,
    )
  ) {
    return {
      message: "Check the Studio Stitch request and try again.",
      status: 400,
    };
  }
  return {
    message: "Unable to complete this Studio Stitch request.",
    status: 500,
  };
}
