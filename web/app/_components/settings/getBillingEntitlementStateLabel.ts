import type { EntitlementState } from "@/lib/clipstitchr/billing/types/EntitlementState";

export function getBillingEntitlementStateLabel(state: EntitlementState) {
  if (state === "active") {
    return "Active";
  }

  if (state === "grace") {
    return "Payment needs attention";
  }

  return "Ended";
}
