import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import { getQuickEditMergedDetectorText } from "@/lib/clipstitchr/server/getQuickEditMergedDetectorText";

export function normalizeQuickEditDetectorCandidates(
  candidates: QuickEditCandidate[],
) {
  const sorted = candidates
    .filter(
      (candidate) =>
        Number.isFinite(candidate.start) &&
        Number.isFinite(candidate.end) &&
        candidate.end > candidate.start &&
        candidate.signals.length,
    )
    .sort((first, second) => first.start - second.start);
  const normalized: QuickEditCandidate[] = [];

  for (const candidate of sorted) {
    const previous = normalized.at(-1);

    if (!previous || previous.end + 0.75 < candidate.start) {
      normalized.push({
        ...candidate,
        confidence: Math.max(0, Math.min(1, candidate.confidence)),
        signals: Array.from(new Set(candidate.signals)).slice(0, 6),
      });
      continue;
    }

    previous.end = Math.max(previous.end, candidate.end);
    previous.confidence = Math.max(previous.confidence, candidate.confidence);
    previous.signals = Array.from(
      new Set([...previous.signals, ...candidate.signals]),
    ).slice(0, 6);
    previous.reason = getQuickEditMergedDetectorText(
      previous.reason,
      candidate.reason,
    );
    previous.stats = getQuickEditMergedDetectorText(
      previous.stats,
      candidate.stats,
    );
  }

  return normalized.slice(0, 10);
}
