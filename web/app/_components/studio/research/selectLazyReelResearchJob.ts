import type { Dispatch, SetStateAction } from "react";
import type { LazyReelResearchJobSelection } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchJobSelection";

export function selectLazyReelResearchJob(
  selection: LazyReelResearchJobSelection,
  isRunning: boolean,
  setSelection: Dispatch<SetStateAction<LazyReelResearchJobSelection>>,
  reset: () => void,
) {
  if (isRunning) {
    return;
  }

  setSelection(selection);
  reset();
}
