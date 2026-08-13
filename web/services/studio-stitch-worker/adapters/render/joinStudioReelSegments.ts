import { join } from "node:path";
import type { StudioStitchRecipeV1 } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import { joinStudioReelCutSegments } from "./joinStudioReelCutSegments";
import { joinStudioReelTransitionSegments } from "./joinStudioReelTransitionSegments";

export async function joinStudioReelSegments(input: {
  ffmpegPath: string;
  recipe: StudioStitchRecipeV1;
  runner: StudioReelCommandRunner;
  segmentPaths: readonly string[];
  workspacePath: string;
}) {
  const outputPath = join(input.workspacePath, "joined.mp4");
  if (input.recipe.transitions.every((transition) => transition.kind === "cut")) {
    await joinStudioReelCutSegments({
      ffmpegPath: input.ffmpegPath,
      listPath: join(input.workspacePath, "segments.txt"),
      outputPath,
      runner: input.runner,
      segmentPaths: input.segmentPaths,
      workspacePath: input.workspacePath,
    });
  } else {
    await joinStudioReelTransitionSegments({
      durationSeconds: input.recipe.durationSeconds,
      ffmpegPath: input.ffmpegPath,
      outputPath,
      runner: input.runner,
      segmentDurations: input.recipe.segments.map(
        (segment) => segment.timelineDurationSeconds,
      ),
      segmentPaths: input.segmentPaths,
      transitions: input.recipe.transitions,
      workspacePath: input.workspacePath,
    });
  }
  return outputPath;
}
