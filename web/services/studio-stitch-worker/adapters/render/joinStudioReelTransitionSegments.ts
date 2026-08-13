import type { StudioStitchTransitionPlan } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchTransitionPlan";
import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import { createStudioReelLocalInputArgs } from "./createStudioReelLocalInputArgs";

export async function joinStudioReelTransitionSegments(input: {
  durationSeconds: number;
  ffmpegPath: string;
  outputPath: string;
  runner: StudioReelCommandRunner;
  segmentDurations: readonly number[];
  segmentPaths: readonly string[];
  transitions: readonly StudioStitchTransitionPlan[];
  workspacePath: string;
}) {
  const filters: string[] = [];
  let compositeDuration = input.segmentDurations[0];
  let previous = "[0:v]";
  let totalOverlap = 0;
  input.transitions.forEach((transition, index) => {
    const duration = transition.durationSeconds || 1 / 30;
    const offset = Math.max(0, compositeDuration - duration);
    const output = `[x${index + 1}]`;
    const name = transition.kind === "dipToBlack" ? "fadeblack" : "fade";
    filters.push(
      `${previous}[${index + 1}:v]xfade=transition=${name}:duration=${duration.toFixed(6)}:offset=${offset.toFixed(6)}${output}`,
    );
    previous = output;
    compositeDuration += input.segmentDurations[index + 1] - duration;
    totalOverlap += duration;
  });
  filters.push(
    `${previous}tpad=stop_mode=clone:stop_duration=${totalOverlap.toFixed(6)},trim=duration=${input.durationSeconds.toFixed(6)},setpts=PTS-STARTPTS[vout]`,
  );
  await input.runner({
    args: [
      "-y",
      ...input.segmentPaths.flatMap((path) => [
        ...createStudioReelLocalInputArgs(path),
      ]),
      "-filter_complex",
      filters.join(";"),
      "-map",
      "[vout]",
      "-an",
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
