import { stat } from "node:fs/promises";
import type { StudioClipsMediaProbe } from "../../contracts/StudioClipsMediaProbe";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsCompletionEvidence } from "../../runtime/StudioClipsCompletionEvidence";
import { addStudioClipsLocalProtocolGuards } from "../process/addStudioClipsLocalProtocolGuards";
import type { StudioClipsCommandRunner } from "../process/StudioClipsCommandRunner";
import { getStudioClipsVideoContentType } from "./getStudioClipsVideoContentType";

const containers: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-m4v": "m4v",
  "video/x-matroska": "matroska",
};

export function createStudioClipsMediaProbe(input: {
  evidence: StudioClipsCompletionEvidence;
  ffprobePath: string;
  runner: StudioClipsCommandRunner;
}) {
  return async (localPath: string, workspacePath: string): Promise<StudioClipsMediaProbe> => {
    const result = await input.runner({
      args: addStudioClipsLocalProtocolGuards([
        "-v",
        "error",
        "-show_entries",
        "format=format_name,duration,size:stream=codec_name,codec_type,width,height",
        "-of",
        "json",
        "-i",
        localPath,
      ]),
      command: input.ffprobePath,
      cwd: workspacePath,
      maximumOutputBytes: 262_144,
      timeoutMs: 30_000,
    });
    let parsed: unknown;
    try {
      parsed = JSON.parse(result.stdout);
    } catch {
      parsed = null;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new StudioClipsWorkerError({
        code: "INVALID_FFPROBE_RESPONSE",
        kind: "permanent",
        publicMessage: "The video metadata could not be read.",
      });
    }
    const payload = parsed as {
      format?: { duration?: string; format_name?: string; size?: string };
      streams?: Array<{
        codec_name?: string;
        codec_type?: string;
        height?: number;
        width?: number;
      }>;
    };
    const video = payload.streams?.find((stream) => stream.codec_type === "video");
    const audio = payload.streams?.find((stream) => stream.codec_type === "audio");
    const contentType = getStudioClipsVideoContentType(localPath);
    const expectedContainer = containers[contentType];
    const formatNames = new Set(
      (payload.format?.format_name ?? "").split(",").map((name) => name.trim()),
    );
    const file = await stat(localPath);
    const durationSeconds = Number(payload.format?.duration);
    const reportedSize = Number(payload.format?.size);

    if (
      !video?.codec_name ||
      !video.width ||
      !video.height ||
      !Number.isFinite(durationSeconds) ||
      durationSeconds <= 0 ||
      !file.isFile() ||
      (Number.isFinite(reportedSize) && reportedSize !== file.size) ||
      (expectedContainer === "matroska"
        ? !formatNames.has("matroska")
        : expectedContainer === "m4v" || expectedContainer === "mp4" || expectedContainer === "mov"
          ? !formatNames.has("mov")
          : !formatNames.has(expectedContainer))
    ) {
      throw new StudioClipsWorkerError({
        code: "UNSUPPORTED_INPUT_MEDIA",
        kind: "permanent",
        publicMessage: "The source is not a supported video file.",
      });
    }

    const probe: StudioClipsMediaProbe = {
      container: expectedContainer,
      contentType,
      durationSeconds,
      hasAudio: Boolean(audio?.codec_name),
      hasVideo: true,
      height: video.height,
      sizeBytes: file.size,
      videoCodec: video.codec_name,
      width: video.width,
      ...(audio?.codec_name ? { audioCodec: audio.codec_name } : {}),
    };
    input.evidence.recordProbe(localPath, probe);
    return probe;
  };
}
