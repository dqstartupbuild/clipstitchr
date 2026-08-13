import type { StudioClipsAnalysis } from "./StudioClipsAnalysis";
import type { StudioClipsOutput } from "./StudioClipsOutput";
import type { StudioClipsProgressEvent } from "./StudioClipsProgressEvent";
import type { StudioClipsResumePointer } from "./StudioClipsResumePointer";
import type { StudioClipsSource } from "./StudioClipsSource";
import type { StudioClipsTaskOptions } from "./StudioClipsTaskOptions";
import type { StudioClipsTaskSummary } from "./StudioClipsTaskSummary";
import type { StudioClipsRenderRevisionSummary } from "./StudioClipsRenderRevisionSummary";

export type StudioClipsTaskDetail = StudioClipsTaskSummary & {
  analysis?: StudioClipsAnalysis;
  cancelRequested: boolean;
  cancelledAt?: string;
  completedAt?: string;
  errorAt?: string;
  events: StudioClipsProgressEvent[];
  options: StudioClipsTaskOptions;
  outputs: StudioClipsOutput[];
  recordVersion: 1;
  renderRevisions: StudioClipsRenderRevisionSummary[];
  resume?: StudioClipsResumePointer;
  source: StudioClipsSource;
  startedAt?: string;
};
