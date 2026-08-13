import type { StudioStitchPipeline } from "../studioStitch/StudioStitchPipeline";
import type { StudioReelWorkerAssetManifest } from "./StudioReelWorkerAssetManifest";

export type StudioReelWorkerClaimRecipe = {
  readonly id: string;
  readonly pipeline: StudioStitchPipeline;
  readonly recipeJson: string;
  readonly assets: readonly StudioReelWorkerAssetManifest[];
};
