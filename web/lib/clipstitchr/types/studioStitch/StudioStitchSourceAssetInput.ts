import type { StudioStitchAssetRef } from "./StudioStitchAssetRef";

export type StudioStitchSourceAssetInput = {
  readonly assetId: string;
  readonly source: StudioStitchAssetRef;
  readonly sourceDurationSeconds: number;
  readonly sourceOffsetSeconds: number;
  readonly playbackRate: number;
  readonly creatorContinuityKey: string | null;
};
