import { ConvexError } from "convex/values";

export function getIsUsageLimitError(error: unknown) {
  if (!(error instanceof ConvexError)) {
    return false;
  }

  const data = error.data;

  return Boolean(
    data &&
      typeof data === "object" &&
      "code" in data &&
      typeof data.code === "string" &&
      [
        "SUBSCRIPTION_REQUIRED",
        "SUBSCRIPTION_INACTIVE",
        "BILLING_REVIEW_REQUIRED",
        "INSUFFICIENT_CREATION_CREDITS",
        "AI_VIDEO_ALLOWANCE_REACHED",
        "USAGE_RECONCILIATION_REQUIRED",
      ].includes(data.code),
  );
}
