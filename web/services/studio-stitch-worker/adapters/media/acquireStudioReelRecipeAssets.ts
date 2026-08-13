import { join } from "node:path";
import type { StudioReelWorkerClaimEnvelope } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimEnvelope";
import type { StudioReelWorkerClaimRecipe } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimRecipe";
import { STUDIO_REEL_WORKER_LIMITS } from "../../constants/studioReelWorkerLimits";
import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import type { StudioReelLocalAsset } from "../../contracts/StudioReelLocalAsset";
import type { StudioReelWorkerR2ObjectStore } from "../../contracts/StudioReelWorkerR2ObjectStore";
import { getStudioReelMediaFileExtension } from "./getStudioReelMediaFileExtension";
import { probeStudioReelSource } from "./probeStudioReelSource";

export async function acquireStudioReelRecipeAssets(input: {
  assertActive: () => Promise<void>;
  claim: StudioReelWorkerClaimEnvelope;
  ffprobePath: string;
  objects: StudioReelWorkerR2ObjectStore;
  recipe: StudioReelWorkerClaimRecipe;
  runner: StudioReelCommandRunner;
  workspacePath: string;
}): Promise<StudioReelLocalAsset[]> {
  const assets: StudioReelLocalAsset[] = [];
  for (let index = 0; index < input.recipe.assets.length; index += 1) {
    await input.assertActive();
    const manifest = input.recipe.assets[index];
    const localPath = join(
      input.workspacePath,
      `source-${String(index + 1).padStart(3, "0")}.${getStudioReelMediaFileExtension(manifest.contentType)}`,
    );
    await input.objects.downloadFile({
      manifest,
      maximumBytes: STUDIO_REEL_WORKER_LIMITS.inputBytes,
      outputPath: localPath,
      ownerId: input.claim.ownerId,
    });
    await probeStudioReelSource({
      ffprobePath: input.ffprobePath,
      localPath,
      manifest,
      runner: input.runner,
      workspacePath: input.workspacePath,
    });
    assets.push({ localPath, manifest });
  }
  return assets;
}
