import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import type { StudioStitchSourceAssetInput } from "@/lib/clipstitchr/types/studioStitch/StudioStitchSourceAssetInput";

export function createStudioStitchSourceAssetInput(
  source: StudioEditorMediaSourceDescriptor,
  creatorContinuityKey: string | null,
): StudioStitchSourceAssetInput {
  return {
    assetId: `${source.kind}_${source.id}`,
    source:
      source.kind === "videoClip"
        ? { kind: "videoClip", videoClipId: source.id }
        : { kind: "stitch", stitchId: source.id },
    sourceDurationSeconds: source.durationSeconds,
    sourceOffsetSeconds: 0,
    playbackRate: 1,
    creatorContinuityKey,
  };
}
