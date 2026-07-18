import { isRateLimitError } from "@convex-dev/rate-limiter";

export function isRateLimitExceededError(error: unknown) {
  if (isRateLimitError(error)) {
    return true;
  }

  if (!error || typeof error !== "object" || !("data" in error)) {
    return false;
  }

  const data = (error as { data?: { kind?: unknown } }).data;

  return data?.kind === "RateLimited";
}
