import { isRateLimitError } from "@convex-dev/rate-limiter";

type RateLimitErrorData = {
  kind: "RateLimited";
  name: string;
  retryAfter: number;
};

function getRateLimitErrorData(error: unknown): RateLimitErrorData | null {
  if (isRateLimitError(error)) {
    return error.data;
  }

  if (!error || typeof error !== "object" || !("data" in error)) {
    return null;
  }

  const data = (error as { data?: Partial<RateLimitErrorData> }).data;

  if (
    data?.kind !== "RateLimited" ||
    typeof data.name !== "string" ||
    typeof data.retryAfter !== "number"
  ) {
    return null;
  }

  return {
    kind: data.kind,
    name: data.name,
    retryAfter: data.retryAfter,
  };
}

export function createRateLimitExceededResponse(error: unknown) {
  const data = getRateLimitErrorData(error);

  if (!data) {
    return null;
  }

  const retryAfterSeconds = Math.max(1, Math.ceil(data.retryAfter / 1000));
  const message = `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`;

  return Response.json(
    {
      error: message,
      message,
      rateLimit: data.name,
      retryAfter: data.retryAfter,
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Cache-Control": "private, no-store",
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}
