import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { classifyStudioReelWorkerPublicError } from "./classifyStudioReelWorkerPublicError";
import { createStudioReelWorkerJsonResponse } from "./createStudioReelWorkerJsonResponse";

export function createStudioReelWorkerErrorResponse(error: unknown) {
  const rateLimit = createRateLimitExceededResponse(error);
  if (rateLimit) {
    rateLimit.headers.set("cache-control", "private, no-store");
    return rateLimit;
  }
  const publicError = classifyStudioReelWorkerPublicError(error);
  return createStudioReelWorkerJsonResponse(
    { error: publicError.message },
    { status: publicError.status },
  );
}
