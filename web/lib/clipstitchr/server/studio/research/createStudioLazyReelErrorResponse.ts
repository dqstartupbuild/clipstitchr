import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { createStudioBetaApiAccessErrorResponse } from "@/lib/clipstitchr/server/studio/access/createStudioBetaApiAccessErrorResponse";
import { getStudioLazyReelPublicErrorMessage } from "./getStudioLazyReelPublicErrorMessage";
import { createStudioLazyReelJsonResponse } from "./createStudioLazyReelJsonResponse";

export function createStudioLazyReelErrorResponse(error: unknown) {
  const accessResponse = createStudioBetaApiAccessErrorResponse(error);

  if (accessResponse) {
    return accessResponse;
  }

  const rateLimitResponse = createRateLimitExceededResponse(error);

  if (rateLimitResponse) {
    rateLimitResponse.headers.set("Cache-Control", "private, no-store");
    return rateLimitResponse;
  }

  return createStudioLazyReelJsonResponse(
    {
      error: getStudioLazyReelPublicErrorMessage(error),
    },
    { status: 400 },
  );
}
