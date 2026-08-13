export function classifyStudioReelWorkerPublicError(error: unknown): {
  readonly message: string;
  readonly status: 400 | 401 | 404 | 409 | 500;
} {
  const message = error instanceof Error ? error.message : "";
  if (/Unauthorized Studio Stitch worker/iu.test(message)) {
    return { message: "Studio Stitch worker authentication failed.", status: 401 };
  }
  if (/\b(not found|is unavailable|missing)\b/iu.test(message)) {
    return { message: "Studio Stitch worker record not found.", status: 404 };
  }
  if (
    /\b(lease|revision conflict|already|attempt does not match|cancelled|does not cover)\b/iu.test(
      message,
    )
  ) {
    return {
      message: "Studio Stitch worker state changed. Claim it again.",
      status: 409,
    };
  }
  if (/\b(invalid|required|must|exceeds|outside)\b/iu.test(message)) {
    return { message: "Studio Stitch worker request is invalid.", status: 400 };
  }
  return { message: "Studio Stitch worker request failed.", status: 500 };
}
