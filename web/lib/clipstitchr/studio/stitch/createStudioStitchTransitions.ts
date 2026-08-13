import type { StudioStitchSegmentPlan } from "../../types/studioStitch/StudioStitchSegmentPlan";
import type { StudioStitchTransitionPlan } from "../../types/studioStitch/StudioStitchTransitionPlan";

export function createStudioStitchTransitions(
  segments: readonly StudioStitchSegmentPlan[],
): StudioStitchTransitionPlan[] {
  return segments.slice(1).map((segment, index) => ({
    id: `transition_${index + 1}`,
    fromSegmentId: segments[index].id,
    toSegmentId: segment.id,
    kind: "cut",
    durationSeconds: 0,
  }));
}
