import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function createHookLabVideoThumbnail(filePath: string) {
  const thumbnailPath = join(
    tmpdir(),
    `clipstitchr-hook-lab-thumbnail-${randomUUID()}.jpg`,
  );
  const ffmpegPath = process.env.PROVIDER_WORKER_FFMPEG_PATH || "ffmpeg";

  await execFileAsync(
    ffmpegPath,
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-ss",
      "0.1",
      "-i",
      filePath,
      "-frames:v",
      "1",
      "-vf",
      "scale='min(720,iw)':-2",
      "-q:v",
      "4",
      thumbnailPath,
    ],
    { maxBuffer: 2 * 1024 * 1024, timeout: 30_000 },
  );

  return {
    body: await readFile(thumbnailPath),
    filePath: thumbnailPath,
  };
}
