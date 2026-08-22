import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { createPublicApiErrorResponse } from "@/lib/clipstitchr/publicApi/createPublicApiErrorResponse";

export function createAppHookGeneratorRateLimitResponse(error: unknown) {
  const rateLimitResponse = createRateLimitExceededResponse(error);

  if (!rateLimitResponse) {
    return null;
  }

  const retryAfter = rateLimitResponse.headers.get("Retry-After") ?? "60";

  return createPublicApiErrorResponse({
    code: "rate_limited",
    message: "Too many hook sets were requested. Try again in a moment.",
    resolution: "Wait for the Retry-After period before sending another request.",
    retryAfter,
    status: 429,
  });
}
