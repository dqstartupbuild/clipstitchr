import type { StudioClipsCoreOptions } from "./StudioClipsCoreOptions";
import type { StudioClipsResumePointer } from "./StudioClipsResumePointer";
import type { StudioClipsSource } from "./StudioClipsSource";

export type StudioClipsWorkerInitialClaim = {
  attempt: number;
  leaseId: string;
  mode: "initial";
  options: StudioClipsCoreOptions;
  ownerId: string;
  productId: string;
  requestedAt: string;
  resume?: StudioClipsResumePointer;
  schemaVersion: "studio-clips-claim-v2";
  source: StudioClipsSource;
  taskId: string;
};
