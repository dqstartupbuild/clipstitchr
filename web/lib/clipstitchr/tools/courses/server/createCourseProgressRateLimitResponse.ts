import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";

export function createCourseProgressRateLimitResponse(error: unknown) {
  const response = createRateLimitExceededResponse(error);

  if (!response) return null;

  return Response.json(
    { message: "Too many progress updates. Try again in a moment." },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Retry-After": response.headers.get("Retry-After") ?? "60",
      },
      status: 429,
    },
  );
}
