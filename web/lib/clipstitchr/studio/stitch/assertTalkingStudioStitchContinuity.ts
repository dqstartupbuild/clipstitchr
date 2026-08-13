import type { StudioStitchSourceAssetInput } from "../../types/studioStitch/StudioStitchSourceAssetInput";

export function assertTalkingStudioStitchContinuity(
  reactionSources: readonly StudioStitchSourceAssetInput[],
): void {
  if (reactionSources.length !== 5) {
    throw new Error("Talking videos require exactly five reaction source beats.");
  }
  const continuityKey = reactionSources[0]?.creatorContinuityKey?.trim();
  if (
    !continuityKey ||
    reactionSources.some(
      (source) => source.creatorContinuityKey?.trim() !== continuityKey,
    )
  ) {
    throw new Error(
      "Talking video reaction beats must use one creator continuity key.",
    );
  }
}
