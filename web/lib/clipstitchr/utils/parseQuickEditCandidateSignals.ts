import { parseQuickEditCandidateSignal } from "@/lib/clipstitchr/utils/parseQuickEditCandidateSignal";

export function parseQuickEditCandidateSignals(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.flatMap((item) => {
        const signal = parseQuickEditCandidateSignal(item);

        return signal ? [signal] : [];
      }),
    ),
  ).slice(0, 6);
}
