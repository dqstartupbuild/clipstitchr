import type { StudioStitchRecipeV1 } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import type { StudioReelLocalAsset } from "../contracts/StudioReelLocalAsset";
import { getStudioReelAssetIdentity } from "../security/getStudioReelAssetIdentity";

export function getStudioReelDemoAsset(
  recipe: StudioStitchRecipeV1,
  assets: readonly StudioReelLocalAsset[],
) {
  const segment = recipe.segments.find(
    (candidate) =>
      candidate.role === "demoSetup" || candidate.role === "demoProof",
  );
  return segment
    ? assets.find(
        (asset) =>
          getStudioReelAssetIdentity(asset.manifest.source) ===
          getStudioReelAssetIdentity(segment.source),
      )
    : undefined;
}
