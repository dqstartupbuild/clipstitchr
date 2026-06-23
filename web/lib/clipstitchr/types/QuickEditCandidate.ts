import type { QuickEditCandidateSignal } from "@/lib/clipstitchr/types/QuickEditCandidateSignal";

export type QuickEditCandidate = {
  start: number;
  end: number;
  confidence: number;
  signals: QuickEditCandidateSignal[];
  reason?: string;
  stats?: string;
};
