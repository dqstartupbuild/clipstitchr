import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { createCliprLipSyncSegmentRanges } from "@/lib/clipstitchr/server/createCliprLipSyncSegmentRanges";
import { createCliprLipSyncVideo } from "@/lib/clipstitchr/server/createCliprLipSyncVideo";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getCliprLipSyncSegmentSeconds } from "@/lib/clipstitchr/server/getCliprLipSyncSegmentSeconds";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { saveCliprAvatarVideoObject } from "@/lib/clipstitchr/server/saveCliprAvatarVideoObject";
import { saveCliprSpeechObject } from "@/lib/clipstitchr/server/saveCliprSpeechObject";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprLipSyncModelId } from "@/lib/clipstitchr/types/CliprLipSyncModelId";

const execFileAsync = promisify(execFile);

type ReplicateClient = ReturnType<typeof createReplicateClient>;
type ActiveCliprLipSyncModelId = Exclude<CliprLipSyncModelId, "none">;

type CreateCliprSegmentedLipSyncVideoOptions = {
  audioBody: ArrayBuffer;
  audioContentType: string;
  jobId: string;
  modelId: ActiveCliprLipSyncModelId;
  replicate: ReplicateClient;
  sourceVideoBody: ArrayBuffer;
  sourceVideoContentType: string;
  targetDurationSeconds: CliprDurationSeconds;
  userId: string;
};

async function runFfmpeg(args: string[]) {
  await execFileAsync(
    process.env.PROVIDER_WORKER_FFMPEG_PATH || "ffmpeg",
    ["-hide_banner", ...args],
    {
      maxBuffer: 1024 * 1024 * 16,
    },
  );
}

function getMinimumSegmentSeconds(modelId: ActiveCliprLipSyncModelId) {
  void modelId;
  return 0;
}

function getMaximumSegmentSeconds(modelId: ActiveCliprLipSyncModelId) {
  void modelId;
  return 30;
}

async function createSegmentFiles({
  audioPath,
  durationSeconds,
  segmentAudioPath,
  segmentVideoPath,
  sourceVideoPath,
  startSeconds,
}: {
  audioPath: string;
  durationSeconds: number;
  segmentAudioPath: string;
  segmentVideoPath: string;
  sourceVideoPath: string;
  startSeconds: number;
}) {
  await runFfmpeg([
    "-y",
    "-ss",
    String(startSeconds),
    "-t",
    String(durationSeconds),
    "-i",
    sourceVideoPath,
    "-map",
    "0:v:0",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    segmentVideoPath,
  ]);
  await runFfmpeg([
    "-y",
    "-ss",
    String(startSeconds),
    "-t",
    String(durationSeconds),
    "-i",
    audioPath,
    "-vn",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "128k",
    segmentAudioPath,
  ]);
}

async function normalizeSegmentForConcat({
  inputPath,
  outputPath,
}: {
  inputPath: string;
  outputPath: string;
}) {
  await runFfmpeg([
    "-y",
    "-i",
    inputPath,
    "-vf",
    "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,fps=30",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
}

async function stitchSegments({
  concatListPath,
  outputPath,
  segmentPaths,
}: {
  concatListPath: string;
  outputPath: string;
  segmentPaths: string[];
}) {
  const concatList = segmentPaths
    .map((path) => `file '${path.replace(/'/g, "'\\''")}'`)
    .join("\n");

  await writeFile(concatListPath, concatList);
  await runFfmpeg([
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatListPath,
    "-c",
    "copy",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
}

export async function createCliprSegmentedLipSyncVideo({
  audioBody,
  jobId,
  modelId,
  replicate,
  sourceVideoBody,
  targetDurationSeconds,
  userId,
}: CreateCliprSegmentedLipSyncVideoOptions) {
  const segmentSeconds = getCliprLipSyncSegmentSeconds(modelId);

  if (!segmentSeconds) {
    throw new Error("Clipr segmented lip sync requires a segmented model.");
  }

  const scratchDir = await mkdtemp(join(tmpdir(), "clipr-lip-sync-"));

  try {
    const sourceVideoPath = join(scratchDir, "source.mp4");
    const audioPath = join(scratchDir, "speech.mp3");
    const stitchedPath = join(scratchDir, "stitched.mp4");
    const concatListPath = join(scratchDir, "concat.txt");
    const ranges = createCliprLipSyncSegmentRanges({
      maximumSegmentSeconds: getMaximumSegmentSeconds(modelId),
      minimumSegmentSeconds: getMinimumSegmentSeconds(modelId),
      segmentSeconds,
      totalDurationSeconds: targetDurationSeconds,
    });
    const normalizedPaths: string[] = [];
    const predictionIds: string[] = [];

    await mkdir(scratchDir, { recursive: true });
    await Promise.all([
      writeFile(sourceVideoPath, Buffer.from(sourceVideoBody)),
      writeFile(audioPath, Buffer.from(audioBody)),
    ]);

    for (const range of ranges) {
      const segmentId = `${jobId}-lip-sync-segment-${range.index}`;
      const segmentVideoPath = join(scratchDir, `segment-${range.index}.mp4`);
      const segmentAudioPath = join(scratchDir, `segment-${range.index}.mp3`);
      const lipSyncPath = join(scratchDir, `lip-sync-${range.index}.mp4`);
      const normalizedPath = join(scratchDir, `normalized-${range.index}.mp4`);

      await createSegmentFiles({
        audioPath,
        durationSeconds: range.durationSeconds,
        segmentAudioPath,
        segmentVideoPath,
        sourceVideoPath,
        startSeconds: range.startSeconds,
      });

      const [segmentVideoBody, segmentAudioBody] = await Promise.all([
        readFile(segmentVideoPath),
        readFile(segmentAudioPath),
      ]);
      const [segmentVideoObject, segmentAudioObject] = await Promise.all([
        saveCliprAvatarVideoObject({
          body: segmentVideoBody.buffer.slice(
            segmentVideoBody.byteOffset,
            segmentVideoBody.byteOffset + segmentVideoBody.byteLength,
          ),
          contentType: "video/mp4",
          jobId: segmentId,
          userId,
        }),
        saveCliprSpeechObject({
          body: segmentAudioBody.buffer.slice(
            segmentAudioBody.byteOffset,
            segmentAudioBody.byteOffset + segmentAudioBody.byteLength,
          ),
          contentType: "audio/mpeg",
          jobId: segmentId,
          userId,
        }),
      ]);
      const [segmentVideoUrl, segmentAudioUrl] = await Promise.all([
        getR2DownloadSignedUrl(segmentVideoObject.key),
        getR2DownloadSignedUrl(segmentAudioObject.key),
      ]);
      const lipSyncVideo = await createCliprLipSyncVideo({
        audioUrl: segmentAudioUrl.url,
        modelId,
        replicate,
        videoUrl: segmentVideoUrl.url,
      });

      predictionIds.push(lipSyncVideo.predictionId);
      await writeFile(lipSyncPath, Buffer.from(lipSyncVideo.body));
      await normalizeSegmentForConcat({
        inputPath: lipSyncPath,
        outputPath: normalizedPath,
      });
      normalizedPaths.push(normalizedPath);
    }

    await stitchSegments({
      concatListPath,
      outputPath: stitchedPath,
      segmentPaths: normalizedPaths,
    });

    const stitchedBody = await readFile(stitchedPath);

    return {
      body: stitchedBody.buffer.slice(
        stitchedBody.byteOffset,
        stitchedBody.byteOffset + stitchedBody.byteLength,
      ),
      contentType: "video/mp4",
      modelId,
      outputUrl: "",
      predictionId: predictionIds.join(","),
    };
  } finally {
    await rm(scratchDir, { force: true, recursive: true });
  }
}
