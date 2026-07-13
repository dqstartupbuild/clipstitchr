import type { AppAdHookRewrite } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewrite";
import type { PublicHookClaimSignal } from "@/lib/clipstitchr/tools/publicHooks/PublicHookClaimSignal";
import type { PublicHookIntent } from "@/lib/clipstitchr/tools/publicHooks/PublicHookIntent";

export type AppAdHookRewriterResult = {
  claimSignals: PublicHookClaimSignal[];
  detectedIntent: PublicHookIntent;
  rewrites: AppAdHookRewrite[];
};
