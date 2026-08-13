import type { StudioReelWorkerCheckpoint } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint";

export class StudioReelWorkerCancellationError extends Error {
  readonly checkpoint: StudioReelWorkerCheckpoint;
  readonly recipeIndex: number;

  constructor(checkpoint: StudioReelWorkerCheckpoint, recipeIndex: number) {
    super("Studio Stitch execution was cancelled.");
    this.name = "StudioReelWorkerCancellationError";
    this.checkpoint = checkpoint;
    this.recipeIndex = recipeIndex;
  }
}
