import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { createStudioBetaApiAccessErrorResponse } from "@/lib/clipstitchr/server/studio/access/createStudioBetaApiAccessErrorResponse";
import { classifyStudioStitchPublicError } from "./classifyStudioStitchPublicError";
import { createStudioStitchJsonResponse } from "./createStudioStitchJsonResponse";

export function createStudioStitchErrorResponse(error: unknown) {
  const accessResponse = createStudioBetaApiAccessErrorResponse(error);
  if (accessResponse) {
    accessResponse.headers.set("cache-control", "private, no-store");
    return accessResponse;
  }

  const rateLimitResponse = createRateLimitExceededResponse(error);
  if (rateLimitResponse) {
    rateLimitResponse.headers.set("cache-control", "private, no-store");
    return rateLimitResponse;
  }

  const publicError = classifyStudioStitchPublicError(error);
  return createStudioStitchJsonResponse(
    { error: publicError.message },
    { status: publicError.status },
  );
}
