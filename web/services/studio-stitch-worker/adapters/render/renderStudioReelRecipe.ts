import { join } from "node:path";
import type { StudioStitchRecipeV1 } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import type { StudioStitchWordTiming } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchWordTiming";
import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import type { StudioReelLocalAsset } from "../../contracts/StudioReelLocalAsset";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { getStudioReelAssetIdentity } from "../../security/getStudioReelAssetIdentity";
import { joinStudioReelSegments } from "./joinStudioReelSegments";
import { renderStudioReelFinalOutput } from "./renderStudioReelFinalOutput";
import { renderStudioReelSegment } from "./renderStudioReelSegment";

export async function renderStudioReelRecipe(input: {
  assertActive: () => Promise<void>;
  assets: readonly StudioReelLocalAsset[];
  ffmpegPath: string;
  fontPath: string;
  recipe: StudioStitchRecipeV1;
  runner: StudioReelCommandRunner;
  timelineWordTimings?: readonly StudioStitchWordTiming[];
  voicePath?: string;
  workspacePath: string;
}) {
  const assets = new Map(
    input.assets.map((asset) => [
      getStudioReelAssetIdentity(asset.manifest.source),
      asset.localPath,
    ]),
  );
  const segmentPaths: string[] = [];
  for (let index = 0; index < input.recipe.segments.length; index += 1) {
    await input.assertActive();
    const segment = input.recipe.segments[index];
    const sourcePath = assets.get(getStudioReelAssetIdentity(segment.source));
    if (!sourcePath) {
      throw new StudioReelWorkerError({
        code: "SEGMENT_SOURCE_MISSING",
        kind: "permanent",
        publicMessage: "A frozen Studio Stitch segment source is missing.",
      });
    }
    const outputPath = join(
      input.workspacePath,
      `segment-${String(index + 1).padStart(3, "0")}.mp4`,
    );
    await renderStudioReelSegment({
      ffmpegPath: input.ffmpegPath,
      outputPath,
      runner: input.runner,
      segment,
      sourcePath,
      workspacePath: input.workspacePath,
    });
    segmentPaths.push(outputPath);
  }
  await input.assertActive();
  const joinedPath = await joinStudioReelSegments({
    ffmpegPath: input.ffmpegPath,
    recipe: input.recipe,
    runner: input.runner,
    segmentPaths,
    workspacePath: input.workspacePath,
  });
  const musicPath = input.recipe.music.source
    ? assets.get(getStudioReelAssetIdentity(input.recipe.music.source))
    : undefined;
  if (input.recipe.music.state === "enabled" && !musicPath) {
    throw new StudioReelWorkerError({
      code: "MUSIC_SOURCE_MISSING",
      kind: "permanent",
      publicMessage: "The frozen Studio Stitch music source is missing.",
    });
  }
  await input.assertActive();
  return renderStudioReelFinalOutput({
    ffmpegPath: input.ffmpegPath,
    fontPath: input.fontPath,
    joinedPath,
    ...(musicPath ? { musicPath } : {}),
    recipe: input.recipe,
    runner: input.runner,
    ...(input.timelineWordTimings
      ? { timelineWordTimings: input.timelineWordTimings }
      : {}),
    ...(input.voicePath ? { voicePath: input.voicePath } : {}),
    workspacePath: input.workspacePath,
  });
}
