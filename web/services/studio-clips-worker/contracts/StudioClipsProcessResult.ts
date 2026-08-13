import type { StudioClipsCheckpoint } from "./StudioClipsCheckpoint";
import type { StudioClipsDurableOutput } from "./StudioClipsDurableOutput";
import type { StudioClipsFailure } from "./StudioClipsFailure";
import type { StudioClipsResumePointer } from "./StudioClipsResumePointer";

export type StudioClipsProcessResult =
  | {
      outputs: StudioClipsDurableOutput[];
      status: "completed";
    }
  | {
      checkpoint: StudioClipsCheckpoint;
      resume?: StudioClipsResumePointer;
      status: "cancelled";
    }
  | {
      checkpoint: StudioClipsCheckpoint;
      failure: StudioClipsFailure;
      resume?: StudioClipsResumePointer;
      status: "error";
    };
