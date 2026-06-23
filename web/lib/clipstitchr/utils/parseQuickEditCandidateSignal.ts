import type { QuickEditCandidateSignal } from "@/lib/clipstitchr/types/QuickEditCandidateSignal";
import { quickEditCandidateSignalValues } from "@/lib/clipstitchr/utils/quickEditCandidateSignalValues";

export function parseQuickEditCandidateSignal(
  value: unknown,
): QuickEditCandidateSignal | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  return quickEditCandidateSignalValues.includes(
    normalized as QuickEditCandidateSignal,
  )
    ? (normalized as QuickEditCandidateSignal)
    : null;
}
