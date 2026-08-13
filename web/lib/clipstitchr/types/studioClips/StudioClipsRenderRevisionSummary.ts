import type { StudioClipsFailure } from "./StudioClipsFailure";
import type { StudioClipsPlatformPreset } from "./StudioClipsPlatformPreset";
import type { StudioClipsTaskStatus } from "./StudioClipsTaskStatus";

export type StudioClipsRenderRevisionSummary = {
  attempt: number;
  cancelRequested: boolean;
  createdAt: string;
  failure?: StudioClipsFailure;
  id: string;
  operationKind:
    | "captions"
    | "merge"
    | "platform_export"
    | "project_style"
    | "regenerate"
    | "split"
    | "trim";
  outputIds: string[];
  platformPreset?: StudioClipsPlatformPreset;
  productId: string;
  progressPercent: number;
  revision: number;
  sourceOutputId: string;
  status: StudioClipsTaskStatus;
  taskId: string;
  updatedAt: string;
};
