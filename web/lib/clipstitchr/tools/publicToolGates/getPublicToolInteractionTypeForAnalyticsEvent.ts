import type { PublicToolAnalyticsEventName } from "@/lib/clipstitchr/tools/publicToolGates/PublicToolAnalyticsEventName";
import type { PublicToolInteractionType } from "@/lib/clipstitchr/tools/publicToolGates/PublicToolInteractionType";

export function getPublicToolInteractionTypeForAnalyticsEvent(
  eventName: PublicToolAnalyticsEventName,
): PublicToolInteractionType | null {
  if (eventName === "tool_result_displayed") return "resultViewed";
  if (eventName === "tool_resource_unlocked") return "resourceUnlocked";
  if (eventName === "tool_paid_cta_clicked") return "paidCtaClicked";
  return null;
}
