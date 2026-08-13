import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { createStudioReelLocalProbeInputArgs } from "./createStudioReelLocalProbeInputArgs";

export async function probeStudioReelAudioDuration(input: {
  ffprobePath: string;
  localPath: string;
  runner: StudioReelCommandRunner;
  workspacePath: string;
}) {
  const result = await input.runner({
    args: [
      "-v",
      "error",
      "-show_entries",
      "format=duration:stream=codec_type",
      "-of",
      "json",
      ...createStudioReelLocalProbeInputArgs(input.localPath),
    ],
    command: input.ffprobePath,
    cwd: input.workspacePath,
    maximumOutputBytes: 131_072,
    timeoutMs: 30_000,
  });
  let value: {
    format?: { duration?: string };
    streams?: Array<{ codec_type?: string }>;
  } = {};
  try {
    value = JSON.parse(result.stdout);
  } catch {
    // Validated below.
  }
  const duration = Number(value.format?.duration);
  if (
    !Number.isFinite(duration) ||
    duration <= 0 ||
    duration > 300 ||
    !value.streams?.some((stream) => stream.codec_type === "audio")
  ) {
    throw new StudioReelWorkerError({
      code: "INVALID_VOICE_AUDIO",
      kind: "permanent",
      publicMessage: "The generated voice audio is invalid.",
    });
  }
  return duration;
}
