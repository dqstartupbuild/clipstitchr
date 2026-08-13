import type { StudioStitchSegmentPlan } from "../../types/studioStitch/StudioStitchSegmentPlan";
import type { StudioStitchSegmentRole } from "../../types/studioStitch/StudioStitchSegmentRole";
import type { StudioStitchSourceAssetInput } from "../../types/studioStitch/StudioStitchSourceAssetInput";
import { assertStudioStitchSourceAssetInput } from "./assertStudioStitchSourceAssetInput";
import { isStudioStitchFrameAligned } from "./isStudioStitchFrameAligned";
import { snapStudioStitchSecondsToFrame } from "./snapStudioStitchSecondsToFrame";

type StudioStitchSegmentInput = {
  readonly role: StudioStitchSegmentRole;
  readonly source: StudioStitchSourceAssetInput;
  readonly durationSeconds: number;
};

export function createStudioStitchSegments(
  inputs: readonly StudioStitchSegmentInput[],
): StudioStitchSegmentPlan[] {
  let timelineStartSeconds = 0;
  return inputs.map((input, index) => {
    assertStudioStitchSourceAssetInput(input.source);
    if (
      !Number.isFinite(input.durationSeconds) ||
      input.durationSeconds <= 0 ||
      !isStudioStitchFrameAligned(input.durationSeconds)
    ) {
      throw new Error("Segment durations must be positive and frame-aligned.");
    }
    const consumedSourceSeconds = input.durationSeconds * input.source.playbackRate;
    if (
      input.source.sourceOffsetSeconds + consumedSourceSeconds >
      input.source.sourceDurationSeconds + 1e-6
    ) {
      throw new Error(
        `Source asset ${input.source.assetId} is too short for its segment.`,
      );
    }
    const segment: StudioStitchSegmentPlan = {
      id: `segment_${index + 1}_${input.role}`,
      order: index,
      role: input.role,
      source: input.source.source,
      sourceDurationSeconds: input.source.sourceDurationSeconds,
      sourceOffsetSeconds: input.source.sourceOffsetSeconds,
      playbackRate: input.source.playbackRate,
      timelineStartSeconds,
      timelineDurationSeconds: input.durationSeconds,
      fit: "cover",
      audio: "muted",
      creatorContinuityKey: input.source.creatorContinuityKey,
    };
    timelineStartSeconds = snapStudioStitchSecondsToFrame(
      timelineStartSeconds + input.durationSeconds,
    );
    return segment;
  });
}
