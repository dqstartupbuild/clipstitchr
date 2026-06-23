import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import type { QuickEditSilenceRange } from "@/lib/clipstitchr/types/QuickEditSilenceRange";

export function createQuickEditSilenceCandidates(ranges: QuickEditSilenceRange[]) {
  return ranges.flatMap((range): QuickEditCandidate[] => {
    if (range.duration < 1.2) {
      return [];
    }

    return [
      {
        start: range.start,
        end: range.end,
        confidence: Math.min(0.9, 0.58 + range.duration * 0.08),
        signals:
          range.duration >= 2.5
            ? ["silence", "no-words", "long-pause"]
            : ["silence", "long-pause"],
        reason: "The audio drops out here.",
        stats: `Silence for ${range.duration.toFixed(1)}s.`,
      },
    ];
  });
}
