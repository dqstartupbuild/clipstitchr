import { PublishingAuthenticationError } from "@/lib/clipstitchr/publishing/identity/PublishingAuthenticationError";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";
import { PublishingServiceConfigurationError } from "@/lib/clipstitchr/publishing/service/PublishingServiceConfigurationError";
import { PublishingServiceResponseError } from "@/lib/clipstitchr/publishing/service/PublishingServiceResponseError";

export function createPublishingProxyErrorResponse(error: unknown): Response {
  let status = 500;
  let code = "internal_error";
  let message = "Publishing could not finish that request. Try again.";
  let retryAfterSeconds: number | undefined;

  if (error instanceof PublishingAuthenticationError) {
    status = 401;
    code = "authentication_required";
    message = "Sign in to continue.";
  } else if (error instanceof PublishingProxyRequestError) {
    status = error.status;
    code = error.code;
    message = "Check that request and try again.";
  } else if (error instanceof PublishingServiceConfigurationError) {
    status = 503;
    code = "publishing_unavailable";
    message = "Publishing is temporarily unavailable.";
  } else if (error instanceof PublishingServiceResponseError) {
    status =
      error.status >= 400 && error.status <= 599 ? error.status : 502;
    code = status === 429 ? "rate_limited" : "publishing_request_failed";
    message =
      status === 429
        ? "Publishing is busy. Wait a moment, then try again."
        : status === 401
          ? "Sign in again to continue."
          : "Publishing could not finish that request. Try again.";
    retryAfterSeconds = error.retryAfterSeconds;
  }

  const headers = new Headers({
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
  });
  if (retryAfterSeconds !== undefined) {
    headers.set("Retry-After", String(retryAfterSeconds));
  }

  return Response.json(
    {
      code,
      message,
      ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
    },
    { status, headers },
  );
}
