import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;

export async function convertVideoToMp4(inputPath: string, outputPath: string) {
  if (!ffmpegPath) {
    throw new Error("ffmpeg is not available.");
  }

  await new Promise<void>((resolve, reject) => {
    const childProcess = spawn(ffmpegPath, [
      "-y",
      "-i",
      inputPath,
      "-vf",
      "scale=trunc(iw/2)*2:trunc(ih/2)*2,setsar=1",
      "-r",
      "30",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-an",
      outputPath,
    ]);

    childProcess.once("error", reject);
    childProcess.once("exit", (code: number | null) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`ffmpeg exited with code ${code ?? "unknown"}.`));
    });
  });
}
