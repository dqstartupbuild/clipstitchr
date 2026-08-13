import type { StudioClipsCheckpoint } from "./StudioClipsCheckpoint";
import type { StudioClipsFailure } from "./StudioClipsFailure";
import type { StudioClipsProgressCode } from "./StudioClipsProgressCode";
import type { StudioClipsResumePointer } from "./StudioClipsResumePointer";
import type { StudioClipsTaskStatus } from "./StudioClipsTaskStatus";

export type StudioClipsProgressEvent = {
  attempt: number;
  checkpoint: StudioClipsCheckpoint;
  code: StudioClipsProgressCode;
  failure?: StudioClipsFailure;
  occurredAt: string;
  ownerId: string;
  productId: string;
  progressPercent: number;
  resume?: StudioClipsResumePointer;
  schemaVersion: "studio-clips-progress-v1";
  status: StudioClipsTaskStatus;
  taskId: string;
};
