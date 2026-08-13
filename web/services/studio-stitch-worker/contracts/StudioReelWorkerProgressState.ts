import type { StudioReelWorkerCheckpoint } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint";

export type StudioReelWorkerProgressState = {
  checkpoint: StudioReelWorkerCheckpoint;
  progressPercent: number;
  recipeIndex: number;
};
