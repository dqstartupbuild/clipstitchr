import type { StudioClipsCheckpoint } from "./StudioClipsCheckpoint";
import type { StudioClipsFailure } from "./StudioClipsFailure";
import type { StudioClipsProgressCode } from "./StudioClipsProgressCode";
import type { StudioClipsResumePointer } from "./StudioClipsResumePointer";

export type StudioClipsProgressEvent = {
  attempt: number;
  checkpoint: StudioClipsCheckpoint;
  code: StudioClipsProgressCode;
  failure?: StudioClipsFailure;
  occurredAt: string;
  progressPercent: number;
  resume?: StudioClipsResumePointer;
  schemaVersion: "studio-clips-progress-v1";
  status: "cancelled" | "completed" | "error" | "processing" | "queued";
};
