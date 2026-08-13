import type { StudioReelWorkerCheckpoint } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint";

export type StudioReelWorkerCheckpointRecord = {
  readonly checkpoint: Exclude<StudioReelWorkerCheckpoint, "completed">;
  readonly recipeIndex: number;
  readonly revision: number;
  readonly snapshotJson: string;
};
