import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";

export function getQuickEditCandidateMergeKey(candidate: QuickEditCandidate) {
  return `${candidate.start.toFixed(2)}:${candidate.end.toFixed(2)}:${candidate.signals.join(",")}`;
}
