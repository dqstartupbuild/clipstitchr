import type { LazyReelResearchJobDefinition } from "./lazyReelResearchJobDefinitions";
import type { LazyReelResearchJobSelection } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchJobSelection";

export function selectLazyReelResearchJobDefinition(
  definition: LazyReelResearchJobDefinition,
  onSelect: (selection: LazyReelResearchJobSelection) => void,
) {
  onSelect({
    kind: definition.kind,
    key: definition.key,
  } as LazyReelResearchJobSelection);
}
