import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";

export function createToolLeadRateLimitResponse(error: unknown) {
  const rateLimitResponse = createRateLimitExceededResponse(error);

  if (!rateLimitResponse) {
    return null;
  }

  return Response.json(
    { message: "Too many sign-ups. Try again later." },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Retry-After": rateLimitResponse.headers.get("Retry-After") ?? "60",
      },
      status: 429,
    },
  );
}
