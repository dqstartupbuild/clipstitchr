import { stat } from "node:fs/promises";
import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import type { StudioReelMediaProbe } from "../../contracts/StudioReelMediaProbe";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { createStudioReelLocalProbeInputArgs } from "./createStudioReelLocalProbeInputArgs";

export async function probeStudioReelMedia(input: {
  ffprobePath: string;
  localPath: string;
  runner: StudioReelCommandRunner;
  workspacePath: string;
}): Promise<StudioReelMediaProbe> {
  const result = await input.runner({
    args: [
      "-v",
      "error",
      "-show_entries",
      "format=format_name,duration,size:stream=codec_name,codec_type,width,height",
      "-of",
      "json",
      ...createStudioReelLocalProbeInputArgs(input.localPath),
    ],
    command: input.ffprobePath,
    cwd: input.workspacePath,
    maximumOutputBytes: 262_144,
    timeoutMs: 30_000,
  });
  let payload: {
    format?: { duration?: string; format_name?: string; size?: string };
    streams?: Array<{
      codec_name?: string;
      codec_type?: string;
      height?: number;
      width?: number;
    }>;
  } = {};
  try {
    payload = JSON.parse(result.stdout);
  } catch {
    // Validated below.
  }
  const video = payload.streams?.find((stream) => stream.codec_type === "video");
  const audio = payload.streams?.find((stream) => stream.codec_type === "audio");
  const durationSeconds = Number(payload.format?.duration);
  const file = await stat(input.localPath);
  const formatNames = new Set((payload.format?.format_name ?? "").split(","));
  if (
    !video?.codec_name ||
    !video.width ||
    !video.height ||
    !file.isFile() ||
    file.size < 1 ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0 ||
    !formatNames.has("mov")
  ) {
    throw new StudioReelWorkerError({
      code: "INVALID_OUTPUT_MEDIA",
      kind: "permanent",
      publicMessage: "Studio Stitch could not verify the rendered MP4.",
    });
  }
  return {
    ...(audio?.codec_name ? { audioCodec: audio.codec_name } : {}),
    durationSeconds,
    hasAudio: Boolean(audio?.codec_name),
    height: video.height,
    sizeBytes: file.size,
    videoCodec: video.codec_name,
    width: video.width,
  };
}
