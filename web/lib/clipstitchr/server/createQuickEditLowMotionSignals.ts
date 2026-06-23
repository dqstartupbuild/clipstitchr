import type { QuickEditCandidateSignal } from "@/lib/clipstitchr/types/QuickEditCandidateSignal";

export function createQuickEditLowMotionSignals(averageDifference: number) {
  const signals: QuickEditCandidateSignal[] = ["low-motion"];

  if (averageDifference < 3.5) {
    signals.push("static-frame");
  }

  if (averageDifference < 1.2) {
    signals.push("repeated-frame");
  }

  return signals;
}
