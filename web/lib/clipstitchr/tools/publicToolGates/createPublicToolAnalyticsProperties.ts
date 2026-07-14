import type { PublicToolGateMode } from "@/lib/clipstitchr/tools/catalog/PublicToolGateMode";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import type { PublicToolAnalyticsEventName } from "@/lib/clipstitchr/tools/publicToolGates/PublicToolAnalyticsEventName";
import type { PublicToolAnalyticsProperties } from "@/lib/clipstitchr/tools/publicToolGates/PublicToolAnalyticsProperties";

export function createPublicToolAnalyticsProperties({
  eventName,
  gateMode,
  toolKey,
  variant,
}: {
  eventName: PublicToolAnalyticsEventName;
  gateMode: PublicToolGateMode;
  toolKey: PublicToolKey;
  variant: PublicToolGateVariant;
}): PublicToolAnalyticsProperties {
  return {
    event_type: eventName,
    experiment_variant: variant,
    gate_mode: gateMode,
    tool_key: toolKey,
  };
}
