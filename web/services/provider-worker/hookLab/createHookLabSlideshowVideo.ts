import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type CreateHookLabSlideshowVideoOptions = {
  readVideo?: (filePath: string) => Promise<Uint8Array>;
  removeFile?: (filePath: string) => Promise<unknown>;
  runSlideshow?: (manifestPath: string, outputPath: string) => Promise<unknown>;
  writeManifest?: (filePath: string, contents: string) => Promise<unknown>;
};

export async function createHookLabSlideshowVideo(
  imagePaths: string[],
  {
    readVideo = readFile,
    removeFile = (filePath) => rm(filePath, { force: true }),
    runSlideshow,
    writeManifest = writeFile,
  }: CreateHookLabSlideshowVideoOptions = {},
) {
  if (!imagePaths.length) {
    throw new Error("The slideshow did not include any images.");
  }

  const manifestPath = join(
    tmpdir(),
    `clipstitchr-hook-lab-slideshow-${randomUUID()}.ffconcat`,
  );
  const outputPath = join(
    tmpdir(),
    `clipstitchr-hook-lab-slideshow-${randomUUID()}.mp4`,
  );
  const manifestLines = ["ffconcat version 1.0"];

  for (const imagePath of imagePaths) {
    manifestLines.push(`file '${imagePath}'`, "duration 3");
  }

  manifestLines.push(`file '${imagePaths.at(-1)}'`);

  try {
    await writeManifest(manifestPath, `${manifestLines.join("\n")}\n`);

    if (runSlideshow) {
      await runSlideshow(manifestPath, outputPath);
    } else {
      await execFileAsync(
        process.env.PROVIDER_WORKER_FFMPEG_PATH || "ffmpeg",
        [
          "-hide_banner",
          "-loglevel",
          "error",
          "-y",
          "-f",
          "concat",
          "-safe",
          "0",
          "-i",
          manifestPath,
          "-vf",
          "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,fps=30",
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
          outputPath,
        ],
        { maxBuffer: 4 * 1024 * 1024, timeout: 120_000 },
      );
    }

    return {
      body: await readVideo(outputPath),
      contentType: "video/mp4",
      durationSeconds: imagePaths.length * 3,
      filePath: outputPath,
    };
  } catch (error) {
    await removeFile(outputPath).catch(() => undefined);
    throw error;
  } finally {
    await removeFile(manifestPath).catch(() => undefined);
  }
}
