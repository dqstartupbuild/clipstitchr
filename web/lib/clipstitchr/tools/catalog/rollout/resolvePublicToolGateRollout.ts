import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { getPublicToolGateRolloutBucket } from "@/lib/clipstitchr/tools/catalog/rollout/getPublicToolGateRolloutBucket";
import type { PublicToolGateRolloutConfiguration } from "@/lib/clipstitchr/tools/catalog/rollout/PublicToolGateRolloutConfiguration";

export function resolvePublicToolGateRollout({
  configuration,
  emailProviderReady,
  opaqueVisitorKey,
  toolKey,
}: {
  configuration: PublicToolGateRolloutConfiguration | null;
  emailProviderReady: boolean;
  opaqueVisitorKey: string;
  toolKey: PublicToolKey;
}): PublicToolGateVariant {
  if (!configuration) return "control";
  if (!opaqueVisitorKey.trim()) return "control";
  if (!configuration.tools.includes(toolKey)) return "control";

  const gate = getPublicToolGateMetadata(toolKey);

  if (gate.mode === "email-native" && !emailProviderReady) {
    return "control";
  }

  if (configuration.allocationPercent === 0) return "control";
  if (configuration.allocationPercent === 100) return configuration.variant;

  const bucket = getPublicToolGateRolloutBucket(opaqueVisitorKey);

  return bucket < configuration.allocationPercent * 100
    ? configuration.variant
    : "control";
}
