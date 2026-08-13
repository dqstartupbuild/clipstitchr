import type { StudioReelWorkerCheckpoint } from "./StudioReelWorkerCheckpoint";

export type StudioReelWorkerResumePointer = {
  readonly checkpoint: Exclude<StudioReelWorkerCheckpoint, "completed">;
  readonly recipeIndex: number;
  readonly revision: number;
  readonly snapshotJson: string;
};
