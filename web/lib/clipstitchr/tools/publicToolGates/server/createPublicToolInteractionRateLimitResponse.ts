import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";

export function createPublicToolInteractionRateLimitResponse(error: unknown) {
  const response = createRateLimitExceededResponse(error);

  if (!response) return null;

  return Response.json(
    { message: "Too many updates. Try again later." },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Retry-After": response.headers.get("Retry-After") ?? "60",
      },
      status: 429,
    },
  );
}
