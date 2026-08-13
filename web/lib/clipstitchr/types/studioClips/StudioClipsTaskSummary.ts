import type { StudioClipsCheckpoint } from "./StudioClipsCheckpoint";
import type { StudioClipsExecutionAvailability } from "./StudioClipsExecutionAvailability";
import type { StudioClipsFailure } from "./StudioClipsFailure";
import type { StudioClipsTaskStatus } from "./StudioClipsTaskStatus";
import type { StudioClipsRenderRevisionSummary } from "./StudioClipsRenderRevisionSummary";

export type StudioClipsTaskSummary = {
  activeRenderRevision?: StudioClipsRenderRevisionSummary;
  archivedAt?: string;
  attempt: number;
  checkpoint?: StudioClipsCheckpoint;
  createdAt: string;
  execution: StudioClipsExecutionAvailability;
  failure?: StudioClipsFailure;
  id: string;
  outputCount: number;
  productId: string;
  progressPercent: number;
  revision: number;
  sourceKind: "r2" | "youtube";
  status: StudioClipsTaskStatus;
  updatedAt: string;
};
