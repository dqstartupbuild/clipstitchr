import type { StudioStitchMusicPlan } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchMusicPlan";
import { escapeStudioReelFfmpegFilterValue } from "./escapeStudioReelFfmpegFilterValue";
import { createStudioReelLocalInputArgs } from "./createStudioReelLocalInputArgs";

export function createStudioReelFinalRenderArgs(input: {
  assPath: string;
  durationSeconds: number;
  fontDirectory: string;
  joinedPath: string;
  music: StudioStitchMusicPlan;
  musicPath?: string;
  outputPath: string;
  voicePath?: string;
}) {
  const args: string[] = [
    "-y",
    ...createStudioReelLocalInputArgs(input.joinedPath),
  ];
  let inputIndex = 1;
  let voiceIndex: number | null = null;
  let musicIndex: number | null = null;
  if (input.voicePath) {
    voiceIndex = inputIndex;
    inputIndex += 1;
    args.push(...createStudioReelLocalInputArgs(input.voicePath));
  }
  if (input.musicPath) {
    musicIndex = inputIndex;
    if (input.music.loopToDuration) args.push("-stream_loop", "-1");
    args.push(...createStudioReelLocalInputArgs(input.musicPath));
  }
  args.push(
    "-vf",
    `subtitles=${escapeStudioReelFfmpegFilterValue(input.assPath)}:fontsdir=${escapeStudioReelFfmpegFilterValue(input.fontDirectory)}`,
    "-map",
    "0:v:0",
  );
  const audioFilters: string[] = [];
  if (voiceIndex !== null) {
    audioFilters.push(
      `[${voiceIndex}:a]atrim=0:${input.durationSeconds.toFixed(6)},apad=whole_dur=${input.durationSeconds.toFixed(6)}[voice]`,
    );
  }
  if (musicIndex !== null) {
    const fadeOutStart = Math.max(
      0,
      input.durationSeconds - input.music.fadeOutSeconds,
    );
    const filters = [
      `atrim=0:${input.durationSeconds.toFixed(6)}`,
      ...(input.music.targetLufs === null
        ? []
        : [`loudnorm=I=${input.music.targetLufs}:TP=-1.5:LRA=11`]),
      `volume=${input.music.volume.toFixed(6)}`,
      ...(input.music.fadeInSeconds > 0
        ? [`afade=t=in:st=0:d=${input.music.fadeInSeconds.toFixed(6)}`]
        : []),
      ...(input.music.fadeOutSeconds > 0
        ? [
            `afade=t=out:st=${fadeOutStart.toFixed(6)}:d=${input.music.fadeOutSeconds.toFixed(6)}`,
          ]
        : []),
      `apad=whole_dur=${input.durationSeconds.toFixed(6)}`,
    ];
    audioFilters.push(`[${musicIndex}:a]${filters.join(",")}[music]`);
  }
  if (voiceIndex !== null && musicIndex !== null) {
    audioFilters.push("[voice][music]amix=inputs=2:duration=first:normalize=0[aout]");
  } else if (voiceIndex !== null) {
    audioFilters.push("[voice]anull[aout]");
  } else if (musicIndex !== null) {
    audioFilters.push("[music]anull[aout]");
  }
  if (audioFilters.length > 0) {
    args.push("-filter_complex", audioFilters.join(";"), "-map", "[aout]");
  } else args.push("-an");
  args.push(
    "-t",
    input.durationSeconds.toFixed(6),
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
    ...(audioFilters.length > 0
      ? ["-c:a", "aac", "-b:a", "192k"]
      : []),
    "-movflags",
    "+faststart",
    input.outputPath,
  );
  return args;
}
