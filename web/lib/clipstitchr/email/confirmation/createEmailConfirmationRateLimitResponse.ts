import { createEmailConfirmationHtmlResponse } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationHtmlResponse";
import { renderEmailConfirmationStatusHtml } from "@/lib/clipstitchr/email/confirmation/renderEmailConfirmationStatusHtml";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";

export function createEmailConfirmationRateLimitResponse(error: unknown) {
  const rateLimitResponse = createRateLimitExceededResponse(error);

  if (!rateLimitResponse) {
    return null;
  }

  return createEmailConfirmationHtmlResponse(
    renderEmailConfirmationStatusHtml("rateLimited"),
    {
      retryAfter: rateLimitResponse.headers.get("Retry-After") ?? "1",
      status: 429,
    },
  );
}
