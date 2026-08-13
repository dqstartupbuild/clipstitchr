import { dirname, join } from "node:path";
import { writeFile } from "node:fs/promises";
import type { StudioStitchRecipeV1 } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import type { StudioStitchWordTiming } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchWordTiming";
import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import { createStudioReelFinalRenderArgs } from "./createStudioReelFinalRenderArgs";
import { createStudioReelOverlayAss } from "./createStudioReelOverlayAss";
import { getStudioReelRuntimeOverlays } from "./getStudioReelRuntimeOverlays";

export async function renderStudioReelFinalOutput(input: {
  ffmpegPath: string;
  fontPath: string;
  joinedPath: string;
  musicPath?: string;
  recipe: StudioStitchRecipeV1;
  runner: StudioReelCommandRunner;
  timelineWordTimings?: readonly StudioStitchWordTiming[];
  voicePath?: string;
  workspacePath: string;
}) {
  const assPath = join(input.workspacePath, "overlays.ass");
  const outputPath = join(input.workspacePath, "output.mp4");
  await writeFile(
    assPath,
    createStudioReelOverlayAss(
      getStudioReelRuntimeOverlays(input.recipe, input.timelineWordTimings),
    ),
    { flag: "wx", mode: 0o600 },
  );
  await input.runner({
    args: createStudioReelFinalRenderArgs({
      assPath,
      durationSeconds: input.recipe.durationSeconds,
      fontDirectory: dirname(input.fontPath),
      joinedPath: input.joinedPath,
      music: input.recipe.music,
      ...(input.musicPath ? { musicPath: input.musicPath } : {}),
      outputPath,
      ...(input.voicePath ? { voicePath: input.voicePath } : {}),
    }),
    command: input.ffmpegPath,
    cwd: input.workspacePath,
    timeoutMs: 600_000,
  });
  return outputPath;
}
