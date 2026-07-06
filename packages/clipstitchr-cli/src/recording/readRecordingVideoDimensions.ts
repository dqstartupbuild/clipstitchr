import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import type { RecordingVideoDimensions } from "./RecordingVideoDimensions.js";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;

function parseVideoDimensions(stderr: string): RecordingVideoDimensions | null {
  const match = stderr.match(/Video:[^\n]*?[, ](\d{2,5})x(\d{2,5})[\s,\[]/);

  if (!match) {
    return null;
  }

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  };
}

export async function readRecordingVideoDimensions(inputPath: string) {
  if (!ffmpegPath) {
    return null;
  }

  return await new Promise<RecordingVideoDimensions | null>((resolve) => {
    let stderr = "";
    const childProcess = spawn(ffmpegPath, [
      "-hide_banner",
      "-i",
      inputPath,
      "-frames:v",
      "1",
      "-f",
      "null",
      "-",
    ]);

    childProcess.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    childProcess.once("error", () => resolve(null));
    childProcess.once("exit", () => resolve(parseVideoDimensions(stderr)));
  });
}
