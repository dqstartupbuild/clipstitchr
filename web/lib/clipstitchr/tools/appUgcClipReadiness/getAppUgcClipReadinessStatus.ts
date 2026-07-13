import type { AppUgcClipReadinessStatus } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipReadinessStatus";
import type { VideoCheckScore } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheckScore";

export function getAppUgcClipReadinessStatus(
  score: VideoCheckScore,
): AppUgcClipReadinessStatus {
  if (score.hasCriticalFailure || score.percentage < 60)
    return "Not ready to hand off";
  return score.percentage >= 80 ? "Ready to reuse" : "Needs a quick fix";
}
