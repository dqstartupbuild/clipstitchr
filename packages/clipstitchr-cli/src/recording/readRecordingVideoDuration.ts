import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { parseRecordingDurationFromFfmpegOutput } from "./parseRecordingDurationFromFfmpegOutput.js";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;

export async function readRecordingVideoDuration(inputPath: string) {
  if (!ffmpegPath) {
    return null;
  }

  return await new Promise<number | null>((resolve) => {
    let stderr = "";
    const childProcess = spawn(ffmpegPath, ["-hide_banner", "-i", inputPath]);

    childProcess.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    childProcess.once("error", () => resolve(null));
    childProcess.once("exit", () =>
      resolve(parseRecordingDurationFromFfmpegOutput(stderr)),
    );
  });
}
