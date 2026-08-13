import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { createStudioBetaApiAccessErrorResponse } from "@/lib/clipstitchr/server/studio/access/createStudioBetaApiAccessErrorResponse";
import { getStudioClipsPublicErrorMessage } from "./getStudioClipsPublicErrorMessage";
import { createStudioClipsPrivateJsonResponse } from "./createStudioClipsPrivateJsonResponse";

export function createStudioClipsErrorResponse(
  error: unknown,
  fallback = "Unable to complete this Studio Clips request.",
) {
  const access = createStudioBetaApiAccessErrorResponse(error);
  if (access) return access;
  const rateLimit = createRateLimitExceededResponse(error);
  if (rateLimit) return rateLimit;
  const message = getStudioClipsPublicErrorMessage(error, fallback);
  const status = /not found/i.test(message)
    ? 404
    : /revision conflict|idempotency key/i.test(message)
      ? 409
      : 400;
  return createStudioClipsPrivateJsonResponse({ error: message }, { status });
}
