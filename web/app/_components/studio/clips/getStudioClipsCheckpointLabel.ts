import type { StudioClipsCheckpoint } from "@/lib/clipstitchr/types/studioClips/StudioClipsCheckpoint";

export function getStudioClipsCheckpointLabel(
  checkpoint: StudioClipsCheckpoint | undefined,
) {
  if (!checkpoint) return "Task recorded";

  const labels: Record<StudioClipsCheckpoint, string> = {
    analyzed: "Candidate moments scored",
    b_roll_ready: "Supporting visuals ready",
    claim_validated: "Request checked",
    completed: "Task finished",
    media_validated: "Video checked",
    output_stored: "Clip saved",
    rendered: "Clip rendered",
    source_acquired: "Source ready",
    transcribed: "Transcript ready",
  };

  return labels[checkpoint];
}
