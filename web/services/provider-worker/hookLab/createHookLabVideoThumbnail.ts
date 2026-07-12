import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type CreateHookLabVideoThumbnailOptions = {
  readThumbnail?: (filePath: string) => Promise<Uint8Array>;
  removeThumbnail?: (filePath: string) => Promise<unknown>;
  runThumbnail?: (inputPath: string, outputPath: string) => Promise<unknown>;
};

export async function createHookLabVideoThumbnail(
  filePath: string,
  {
    readThumbnail = readFile,
    removeThumbnail = (path) => rm(path, { force: true }),
    runThumbnail,
  }: CreateHookLabVideoThumbnailOptions = {},
) {
  const thumbnailPath = join(
    tmpdir(),
    `clipstitchr-hook-lab-thumbnail-${randomUUID()}.jpg`,
  );
  const ffmpegPath = process.env.PROVIDER_WORKER_FFMPEG_PATH || "ffmpeg";

  try {
    if (runThumbnail) {
      await runThumbnail(filePath, thumbnailPath);
    } else {
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
    }

    return {
      body: await readThumbnail(thumbnailPath),
      filePath: thumbnailPath,
    };
  } catch (error) {
    await removeThumbnail(thumbnailPath).catch(() => undefined);
    throw error;
  }
}
