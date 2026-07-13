import type { VideoCheck } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheck";

export function getProductDemoReadinessFixes(checks: VideoCheck[]) {
  return checks
    .filter((check) => check.status !== "pass" && check.fix)
    .sort((left, right) => {
      const leftPriority = left.isCritical
        ? 0
        : left.status === "fail"
          ? 1
          : 2;
      const rightPriority = right.isCritical
        ? 0
        : right.status === "fail"
          ? 1
          : 2;

      return leftPriority - rightPriority;
    })
    .slice(0, 3);
}
