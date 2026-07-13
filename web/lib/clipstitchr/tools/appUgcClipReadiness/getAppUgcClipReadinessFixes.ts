import type { VideoCheck } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheck";

export function getAppUgcClipReadinessFixes(checks: VideoCheck[]) {
  return checks
    .filter((check) => check.status !== "pass" && check.fix)
    .sort((left, right) => {
      const leftRank =
        left.isCritical && left.status === "fail"
          ? 0
          : left.status === "fail"
            ? 1
            : 2;
      const rightRank =
        right.isCritical && right.status === "fail"
          ? 0
          : right.status === "fail"
            ? 1
            : 2;
      return leftRank - rightRank || right.weight - left.weight;
    })
    .slice(0, 3);
}
