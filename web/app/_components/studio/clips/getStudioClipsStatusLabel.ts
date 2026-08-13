import type { StudioClipsTaskStatus } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsTaskStatus";

export function getStudioClipsStatusLabel(status: StudioClipsTaskStatus) {
  const labels: Record<StudioClipsTaskStatus, string> = {
    cancelled: "Cancelled",
    completed: "Completed",
    error: "Needs attention",
    processing: "Processing",
    provider_unavailable: "Processing unavailable",
    queued: "Waiting",
  };

  return labels[status];
}
