import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import type { StudioReelWorkerAssetManifest } from "../../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerAssetManifest";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { createStudioReelLocalProbeInputArgs } from "./createStudioReelLocalProbeInputArgs";

export async function probeStudioReelSource(input: {
  ffprobePath: string;
  localPath: string;
  manifest: StudioReelWorkerAssetManifest;
  runner: StudioReelCommandRunner;
  workspacePath: string;
}) {
  const result = await input.runner({
    args: [
      "-v",
      "error",
      "-show_entries",
      "format=duration:stream=codec_name,codec_type,width,height",
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
    format?: { duration?: string };
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
  const duration = Number(payload.format?.duration);
  const isAudioSource = input.manifest.contentType.startsWith("audio/");
  if (
    !Number.isFinite(duration) ||
    duration <= 0 ||
    Math.abs(duration - input.manifest.durationSeconds) > 1 ||
    (isAudioSource && !audio?.codec_name) ||
    (!isAudioSource && (!video?.codec_name || !video.width || !video.height)) ||
    (input.manifest.width !== undefined && video?.width !== input.manifest.width) ||
    (input.manifest.height !== undefined && video?.height !== input.manifest.height) ||
    (input.manifest.hasAudio === true && !audio?.codec_name)
  ) {
    throw new StudioReelWorkerError({
      code: "SOURCE_MEDIA_MISMATCH",
      kind: "permanent",
      publicMessage: "A Studio Stitch source failed its media metadata check.",
    });
  }
  return {
    durationSeconds: duration,
    hasAudio: Boolean(audio?.codec_name),
    hasVideo: Boolean(video?.codec_name),
  };
}
