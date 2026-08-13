import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getStudioClipsPublicErrorMessage } from "./getStudioClipsPublicErrorMessage";
import { createStudioClipsPrivateJsonResponse } from "./createStudioClipsPrivateJsonResponse";

export function createStudioClipsWorkerErrorResponse(error: unknown) {
  const rateLimit = createRateLimitExceededResponse(error);
  if (rateLimit) return rateLimit;
  const message = getStudioClipsPublicErrorMessage(
    error,
    "Studio Clips worker request failed.",
  );
  const status = /Unauthorized Studio Clips worker/i.test(message)
    ? 401
    : /lease|revision conflict/i.test(message)
      ? 409
      : 400;
  return createStudioClipsPrivateJsonResponse({ error: message }, { status });
}
