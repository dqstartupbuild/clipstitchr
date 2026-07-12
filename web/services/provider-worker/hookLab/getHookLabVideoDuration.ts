import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function getHookLabVideoDuration(filePath: string) {
  const ffprobePath = process.env.PROVIDER_WORKER_FFPROBE_PATH || "ffprobe";
  const { stdout } = await execFileAsync(
    ffprobePath,
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ],
    { maxBuffer: 64 * 1024, timeout: 30_000 },
  );
  const duration = Number(stdout.trim());

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("The imported video duration could not be read.");
  }

  return duration;
}
