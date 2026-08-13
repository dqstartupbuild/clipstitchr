import type { LazyReelResearchJobSelection } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchJobSelection";

export function getLazyReelResearchJobIsSelected(
  current: LazyReelResearchJobSelection,
  candidate: LazyReelResearchJobSelection,
) {
  return current.kind === candidate.kind && current.key === candidate.key;
}
