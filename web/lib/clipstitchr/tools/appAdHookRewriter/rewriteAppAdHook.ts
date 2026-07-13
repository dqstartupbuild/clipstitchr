import type { AppAdHookRewriterInput } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewriterInput";
import type { AppAdHookRewriterResult } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewriterResult";
import { createAppAdHookRewrites } from "@/lib/clipstitchr/tools/appAdHookRewriter/createAppAdHookRewrites";
import { detectPublicHookIntent } from "@/lib/clipstitchr/tools/publicHooks/detectPublicHookIntent";
import { findPublicHookClaimSignals } from "@/lib/clipstitchr/tools/publicHooks/findPublicHookClaimSignals";

export function rewriteAppAdHook(
  input: AppAdHookRewriterInput,
): AppAdHookRewriterResult {
  return {
    claimSignals: findPublicHookClaimSignals(
      [input.currentHook, input.problem, input.desiredOutcome].join(" "),
    ),
    detectedIntent: detectPublicHookIntent({
      audience: input.audience,
      desiredOutcome: input.desiredOutcome,
      hook: input.currentHook,
      problem: input.problem,
    }),
    rewrites: createAppAdHookRewrites(input),
  };
}
