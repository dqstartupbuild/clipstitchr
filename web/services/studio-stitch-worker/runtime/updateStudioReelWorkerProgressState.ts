import type { StudioReelWorkerCheckpoint } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint";
import type { StudioReelWorkerProgressState } from "../contracts/StudioReelWorkerProgressState";

export function updateStudioReelWorkerProgressState(
  state: StudioReelWorkerProgressState,
  stage: {
    checkpoint: StudioReelWorkerCheckpoint;
    progressPercent?: number;
    recipeIndex: number;
  },
): void {
  if (stage.checkpoint !== "completed") {
    state.checkpoint = stage.checkpoint;
  }
  state.recipeIndex = stage.recipeIndex;
  state.progressPercent = Math.max(
    state.progressPercent,
    stage.progressPercent ?? state.progressPercent,
  );
}
