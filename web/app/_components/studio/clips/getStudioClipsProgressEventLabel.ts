import type { StudioClipsProgressCode } from "@/lib/clipstitchr/types/studioClips/StudioClipsProgressCode";

export function getStudioClipsProgressEventLabel(
  code: StudioClipsProgressCode,
) {
  const labels: Record<StudioClipsProgressCode, string> = {
    analyzed: "Candidate moments scored",
    b_roll_ready: "Supporting visuals ready",
    cancelled: "Task cancelled",
    completed: "Task finished",
    failed: "Task stopped",
    media_validated: "Video checked",
    output_stored: "Clip saved",
    rendered: "Clip rendered",
    source_acquired: "Source ready",
    transcribed: "Transcript ready",
    worker_started: "Processing started",
  };

  return labels[code];
}
