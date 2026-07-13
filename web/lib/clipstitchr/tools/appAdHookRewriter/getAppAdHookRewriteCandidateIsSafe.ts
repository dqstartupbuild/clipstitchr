import type { AppAdHookRewriterInput } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewriterInput";
import { findPublicHookClaimSignals } from "@/lib/clipstitchr/tools/publicHooks/findPublicHookClaimSignals";
import { getPublicHookTextSimilarity } from "@/lib/clipstitchr/tools/publicHooks/getPublicHookTextSimilarity";
import { normalizePublicHookText } from "@/lib/clipstitchr/tools/publicHooks/normalizePublicHookText";

export function getAppAdHookRewriteCandidateIsSafe({
  candidate,
  input,
  seen,
}: {
  candidate: string;
  input: AppAdHookRewriterInput;
  seen: Set<string>;
}) {
  const normalizedCandidate = normalizePublicHookText(candidate);
  const claimCheckText = normalizedCandidate.replaceAll(input.appContext, "");

  return (
    normalizedCandidate.length >= 3 &&
    normalizedCandidate.length <= 140 &&
    !/\{\{|\}\}/.test(normalizedCandidate) &&
    !(!input.firstVisual.trim() && /\b(?:that|this)\b/i.test(normalizedCandidate)) &&
    !seen.has(normalizedCandidate.toLowerCase()) &&
    getPublicHookTextSimilarity(input.currentHook, normalizedCandidate) < 0.82 &&
    findPublicHookClaimSignals(claimCheckText).length === 0
  );
}
