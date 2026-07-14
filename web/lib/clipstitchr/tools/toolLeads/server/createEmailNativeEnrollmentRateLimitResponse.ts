import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";

export function createEmailNativeEnrollmentRateLimitResponse(error: unknown) {
  const rateLimitResponse = createRateLimitExceededResponse(error);

  if (!rateLimitResponse) return null;

  return Response.json(
    { message: "Too many enrollment requests. Try again later." },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Retry-After": rateLimitResponse.headers.get("Retry-After") ?? "60",
      },
      status: 429,
    },
  );
}
