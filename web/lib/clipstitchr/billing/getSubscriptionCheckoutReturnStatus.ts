import type { SubscriptionCheckoutReturnStatus } from "@/lib/clipstitchr/billing/types/SubscriptionCheckoutReturnStatus";

export function getSubscriptionCheckoutReturnStatus(
  value: string | string[] | undefined,
): SubscriptionCheckoutReturnStatus | undefined {
  return value === "canceled" || value === "success" ? value : undefined;
}
