import type { Dispatch, SetStateAction } from "react";
import type { StudioStitchGenerationRun } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchGenerationRun";

export function updateStudioStitchViewedRun(
  run: StudioStitchGenerationRun,
  setRun: Dispatch<SetStateAction<StudioStitchGenerationRun>>,
  onRunChange: (run: StudioStitchGenerationRun) => void,
) {
  setRun(run);
  onRunChange(run);
}
