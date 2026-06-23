import { parseQuickEditCandidate } from "@/lib/clipstitchr/utils/parseQuickEditCandidate";

export function parseQuickEditCandidates(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const candidate = parseQuickEditCandidate(item);

    return candidate ? [candidate] : [];
  }).slice(0, 10);
}
