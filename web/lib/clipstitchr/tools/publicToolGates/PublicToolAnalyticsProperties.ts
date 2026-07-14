import type { PublicToolGateMode } from "@/lib/clipstitchr/tools/catalog/PublicToolGateMode";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import type { PublicToolAnalyticsEventName } from "@/lib/clipstitchr/tools/publicToolGates/PublicToolAnalyticsEventName";

export type PublicToolAnalyticsProperties = {
  event_type: PublicToolAnalyticsEventName;
  experiment_variant: PublicToolGateVariant;
  gate_mode: PublicToolGateMode;
  tool_key: PublicToolKey;
};
