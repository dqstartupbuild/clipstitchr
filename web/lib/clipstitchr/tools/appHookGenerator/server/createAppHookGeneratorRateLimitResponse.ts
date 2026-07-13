import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";

export function createAppHookGeneratorRateLimitResponse(error: unknown) {
  const rateLimitResponse = createRateLimitExceededResponse(error);

  if (!rateLimitResponse) {
    return null;
  }

  const retryAfter = rateLimitResponse.headers.get("Retry-After") ?? "60";

  return Response.json(
    {
      message: "Too many hook sets were requested. Try again in a moment.",
    },
    {
      headers: { "Retry-After": retryAfter },
      status: 429,
    },
  );
}
