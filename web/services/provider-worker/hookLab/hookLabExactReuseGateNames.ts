import type { HookLabExactReuseGates } from "@/lib/clipstitchr/types/HookLabExactReuseGates";

export const HOOK_LAB_EXACT_REUSE_GATE_NAMES = [
  "claimsAreSupported",
  "fitsActiveProductAudienceAndDemo",
  "hasClearVisualReferents",
  "hasNoSourceSpecificTokens",
  "independentOfSourceCaptionAudioAndTrend",
  "isCompleteInVisualContext",
  "isShortNaturalOverlay",
  "thirdPartyReuseFeelsGeneric",
] as const satisfies readonly (keyof HookLabExactReuseGates)[];
