import type { StudioClipsCheckpoint } from "./StudioClipsCheckpoint";

export type StudioClipsResumePointer = {
  checkpoint: Exclude<StudioClipsCheckpoint, "claim_validated" | "completed">;
  revision: number;
};
