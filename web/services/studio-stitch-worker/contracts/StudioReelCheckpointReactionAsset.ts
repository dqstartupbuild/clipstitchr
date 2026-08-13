import type { StudioStitchAssetRef } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchAssetRef";

export type StudioReelCheckpointReactionAsset = {
  readonly contentType: "video/mp4";
  readonly currency: string;
  readonly durationSeconds: number;
  readonly hasAudio: boolean;
  readonly height: number;
  readonly modelId: string;
  readonly objectKey: string;
  readonly objectVersion: string;
  readonly pricePaid: number;
  readonly purchasedAt: string;
  readonly recipeId: string;
  readonly sha256: string;
  readonly sizeBytes: number;
  readonly source: StudioStitchAssetRef;
  readonly videoId: string;
  readonly width: number;
};
