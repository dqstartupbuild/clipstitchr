import type { VideoCheck } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheck";
import type { VideoCheckScore } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheckScore";

export function scoreVideoChecks(checks: VideoCheck[]): VideoCheckScore {
  const totalWeight = checks.reduce((total, check) => total + check.weight, 0);
  const earnedWeight = checks.reduce((total, check) => {
    if (check.status === "pass") {
      return total + check.weight;
    }

    if (check.status === "warning") {
      return total + check.weight * 0.5;
    }

    return total;
  }, 0);

  return {
    percentage:
      totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0,
    hasCriticalFailure: checks.some(
      (check) => check.isCritical && check.status === "fail",
    ),
  };
}
