import type { StudioReelWorkerAvailability } from "../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerAvailability";

export function getStudioReelExecutionAvailability(): StudioReelWorkerAvailability {
  const studioEnabled = process.env.STUDIO_BETA_ENABLED === "true";
  const executionEnabled =
    process.env.STUDIO_STITCH_EXECUTION_ENABLED === "true";
  const secretConfigured =
    (process.env.STUDIO_STITCH_WORKER_SECRET?.trim().length ?? 0) >= 32;
  if (!studioEnabled || !executionEnabled || !secretConfigured) {
    return {
      state: "unavailable",
      reason: !studioEnabled
        ? "Studio Beta is disabled."
        : !executionEnabled
        ? "Studio Stitch execution is disabled."
        : "Studio Stitch worker authentication is unavailable.",
    };
  }
  return { state: "configured", reason: null };
}
