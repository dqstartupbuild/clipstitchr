import type { StudioClipsExecutionAvailability } from "../../lib/clipstitchr/types/studioClips/StudioClipsExecutionAvailability";

export function getStudioClipsExecutionAvailability(): StudioClipsExecutionAvailability {
  if (process.env.STUDIO_CLIPS_WORKER_QUEUE_ENABLED === "true") {
    return { state: "available" };
  }
  return {
    message:
      "Clip generation is unavailable because the Studio Clips worker queue adapter is not configured.",
    reasonCode: "worker_adapter_not_configured",
    state: "unavailable",
  };
}
