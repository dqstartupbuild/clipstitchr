import type { StudioStitchSegmentPlan } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchSegmentPlan";
import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import { createStudioReelLocalInputArgs } from "./createStudioReelLocalInputArgs";
import { getStudioReelSegmentVideoFilter } from "./getStudioReelSegmentVideoFilter";

export async function renderStudioReelSegment(input: {
  ffmpegPath: string;
  outputPath: string;
  runner: StudioReelCommandRunner;
  segment: StudioStitchSegmentPlan;
  sourcePath: string;
  workspacePath: string;
}) {
  const consumed =
    input.segment.timelineDurationSeconds * input.segment.playbackRate;
  await input.runner({
    args: [
      "-y",
      "-ss",
      input.segment.sourceOffsetSeconds.toFixed(6),
      "-t",
      consumed.toFixed(6),
      ...createStudioReelLocalInputArgs(input.sourcePath),
      "-vf",
      getStudioReelSegmentVideoFilter(input.segment),
      "-an",
      "-t",
      input.segment.timelineDurationSeconds.toFixed(6),
      "-r",
      "30",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      input.outputPath,
    ],
    command: input.ffmpegPath,
    cwd: input.workspacePath,
    timeoutMs: 300_000,
  });
}
