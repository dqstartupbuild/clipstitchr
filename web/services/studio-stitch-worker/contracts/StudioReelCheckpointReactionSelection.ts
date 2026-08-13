import type { StudioStitchAssetRef } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchAssetRef";

export type StudioReelCheckpointReactionSelection = {
  readonly modelId: string;
  readonly price: number;
  readonly recipeId: string;
  readonly source: StudioStitchAssetRef;
  readonly title: string;
  readonly videoId: string;
};
