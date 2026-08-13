import { stat } from "node:fs/promises";
import { join } from "node:path";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import { addStudioClipsLocalProtocolGuards } from "../process/addStudioClipsLocalProtocolGuards";
import type { StudioClipsCommandRunner } from "../process/StudioClipsCommandRunner";

export function createStudioClipsTranscriptionAudio(input: {
  ffmpegPath: string;
  runner: StudioClipsCommandRunner;
}) {
  return async (sourcePath: string, workspacePath: string): Promise<string> => {
    const audioPath = join(workspacePath, "transcription-audio.mp3");
    await input.runner({
      args: addStudioClipsLocalProtocolGuards([
        "-y",
        "-v",
        "error",
        "-i",
        sourcePath,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-b:a",
        "64k",
        audioPath,
      ]),
      command: input.ffmpegPath,
      cwd: workspacePath,
      timeoutMs: 900_000,
    });
    const file = await stat(audioPath);
    if (!file.isFile() || file.size < 1 || file.size > 67_108_864) {
      throw new StudioClipsWorkerError({
        code: "TRANSCRIPTION_AUDIO_INVALID",
        kind: "permanent",
        publicMessage: "Studio Clips could not prepare bounded transcription audio.",
      });
    }
    return audioPath;
  };
}
