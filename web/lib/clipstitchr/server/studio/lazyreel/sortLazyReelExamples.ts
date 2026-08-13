import type { LazyReelExample } from "@/lib/clipstitchr/types/lazyreel/LazyReelExample";

export function sortLazyReelExamples(examples: LazyReelExample[]) {
  return [...examples].sort(
    (left, right) =>
      right.viewsPerFollower - left.viewsPerFollower ||
      right.views - left.views ||
      left.url.localeCompare(right.url),
  );
}
