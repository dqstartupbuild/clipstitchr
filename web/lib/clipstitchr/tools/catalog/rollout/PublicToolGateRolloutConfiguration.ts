import type { PublicToolApprovedGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolApprovedGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

export type PublicToolGateRolloutConfiguration = {
  allocationPercent: number;
  tools: readonly PublicToolKey[];
  variant: PublicToolApprovedGateVariant;
};
