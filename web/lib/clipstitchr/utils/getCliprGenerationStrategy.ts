import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprGenerationStrategy } from "@/lib/clipstitchr/types/CliprGenerationStrategy";

const singleVideoContentTypes = new Set<CliprContentType>([
  "avatar-talking-head",
  "text-shot",
  "soft-cta",
]);

export function getCliprGenerationStrategy({
  contentType,
  durationSeconds,
}: {
  contentType: CliprContentType;
  durationSeconds: CliprDurationSeconds;
}): CliprGenerationStrategy {
  if (singleVideoContentTypes.has(contentType) && durationSeconds <= 30) {
    return {
      sceneCount: 1,
      sceneDurationSeconds: Math.min(20, durationSeconds),
      strategy: "single-video",
    };
  }

  const sceneCount = durationSeconds === 60 ? 6 : 3;

  return {
    sceneCount,
    sceneDurationSeconds: Math.ceil(durationSeconds / sceneCount),
    strategy: "multi-scene",
  };
}
