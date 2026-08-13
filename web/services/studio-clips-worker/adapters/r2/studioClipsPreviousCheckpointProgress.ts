import type { StudioClipsCheckpoint } from "../../contracts/StudioClipsCheckpoint";
import type { StudioClipsProgressCode } from "../../contracts/StudioClipsProgressCode";

export const studioClipsPreviousCheckpointProgress: Record<
  Exclude<StudioClipsCheckpoint, "claim_validated" | "completed">,
  { checkpoint: StudioClipsCheckpoint; code: StudioClipsProgressCode }
> = {
  analyzed: { checkpoint: "transcribed", code: "transcribed" },
  b_roll_ready: { checkpoint: "analyzed", code: "analyzed" },
  media_validated: { checkpoint: "source_acquired", code: "source_acquired" },
  output_stored: { checkpoint: "rendered", code: "rendered" },
  rendered: { checkpoint: "b_roll_ready", code: "b_roll_ready" },
  source_acquired: { checkpoint: "claim_validated", code: "worker_started" },
  transcribed: { checkpoint: "media_validated", code: "media_validated" },
};
