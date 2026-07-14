import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";
import type { PublicToolGateMode } from "@/lib/clipstitchr/tools/catalog/PublicToolGateMode";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import type { PublicToolAnalyticsEventName } from "@/lib/clipstitchr/tools/publicToolGates/PublicToolAnalyticsEventName";
import { createPublicToolAnalyticsProperties } from "@/lib/clipstitchr/tools/publicToolGates/createPublicToolAnalyticsProperties";
import { getPublicToolInteractionTypeForAnalyticsEvent } from "@/lib/clipstitchr/tools/publicToolGates/getPublicToolInteractionTypeForAnalyticsEvent";
import { recordPublicToolInteraction } from "@/lib/clipstitchr/tools/publicToolGates/recordPublicToolInteraction";

export function trackPublicToolAnalyticsEvent(
  eventName: PublicToolAnalyticsEventName,
  {
    gateMode,
    toolKey,
    variant,
  }: {
    gateMode: PublicToolGateMode;
    toolKey: PublicToolKey;
    variant: PublicToolGateVariant;
  },
) {
  try {
    trackPostHogEvent(
      eventName,
      createPublicToolAnalyticsProperties({
        eventName,
        gateMode,
        toolKey,
        variant,
      }),
    );
  } catch {
    // Analytics must never block the browser value a visitor already earned.
  }

  const interactionType =
    getPublicToolInteractionTypeForAnalyticsEvent(eventName);

  if (interactionType) {
    void recordPublicToolInteraction(toolKey, interactionType);
  }
}
