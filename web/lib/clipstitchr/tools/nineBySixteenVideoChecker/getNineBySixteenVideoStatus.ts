import type { NineBySixteenVideoStatus } from "@/lib/clipstitchr/tools/nineBySixteenVideoChecker/NineBySixteenVideoStatus";
import type { VideoCheckScore } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheckScore";

export function getNineBySixteenVideoStatus({
  hasCriticalFailure,
  percentage,
}: VideoCheckScore): NineBySixteenVideoStatus {
  if (hasCriticalFailure || percentage < 60) {
    return "Needs changes";
  }

  return percentage >= 85 ? "Ready" : "Almost ready";
}
