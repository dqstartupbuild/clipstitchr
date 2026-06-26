import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { getQuickEditPlaybackDuration } from "./getQuickEditPlaybackDuration.mjs";
import { readQuickEditSuggestions } from "./readQuickEditSuggestions.mjs";

const execFileAsync = promisify(execFile);
const api = anyApi;
const packageRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const MEDIA_MAX_JOB_ATTEMPTS = 3;
const TIKTOK_OUTPUT_HEIGHT = 1920;
const TIKTOK_OUTPUT_WIDTH = 1080;
const VIDEO_POSTER_CAPTURE_VERSION = 2;

function readMaxJobs(args) {
  const equalsArg = args.find((arg) => arg.startsWith("--max-jobs="));
  const flagIndex = args.indexOf("--max-jobs");
  const rawValue =
    equalsArg?.slice("--max-jobs=".length) ??
    (flagIndex === -1 ? undefined : args[flagIndex + 1]) ??
    1;
  const value = Number(rawValue);

  return Math.max(1, Number.isFinite(value) ? Math.floor(value) : 1);
}

function readArgs() {
  const args = process.argv.slice(2);

  return {
    check: args.includes("--check"),
    once: args.includes("--once"),
    maxJobs: readMaxJobs(args),
  };
}

async function loadWorkerEnv() {
  const envPath = join(packageRoot, ".env.worker.local");

  try {
    const contents = await readFile(envPath, "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [name, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").replace(/\s+#.*$/, "").trim();

      if (!process.env[name]) {
        process.env[name] = value;
      }
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function getConfig() {
  return {
    convexUrl: getRequiredEnv("NEXT_PUBLIC_CONVEX_URL"),
    ffmpegPath: process.env.MEDIA_WORKER_FFMPEG_PATH || "ffmpeg",
    ffprobePath: process.env.MEDIA_WORKER_FFPROBE_PATH || "ffprobe",
    lockMs: Number(process.env.MEDIA_WORKER_LOCK_MS || 300000),
    mediaWorkerSecret: getRequiredEnv("MEDIA_WORKER_SECRET"),
    pollIntervalMs: Number(process.env.MEDIA_WORKER_POLL_INTERVAL_MS || 2000),
    scratchDir:
      process.env.MEDIA_WORKER_SCRATCH_DIR || "/tmp/clipstitchr-media-worker",
    workerId: process.env.MEDIA_WORKER_ID || `media-worker-${process.pid}`,
    r2: {
      accountId: getRequiredEnv("R2_ACCOUNT_ID"),
      accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
      bucketName: getRequiredEnv("R2_BUCKET_NAME"),
      secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  };
}

function createR2Client(config) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2.accessKeyId,
      secretAccessKey: config.r2.secretAccessKey,
    },
  });
}

async function streamToBuffer(body) {
  const chunks = [];

  for await (const chunk of body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

async function downloadR2Object({ client, config, key, outputPath }) {
  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error("R2 object response was empty.");
  }

  await writeFile(outputPath, await streamToBuffer(response.Body));
}

const allowedReplicateOutputHosts = new Set([
  "api.replicate.com",
  "replicate.delivery",
]);

function getSafeReplicateOutputUrl(rawUrl) {
  const url = new URL(rawUrl);

  if (url.protocol !== "https:") {
    throw new Error("Swapr output URLs must use HTTPS.");
  }

  if (
    !allowedReplicateOutputHosts.has(url.hostname) &&
    !url.hostname.endsWith(".replicate.delivery")
  ) {
    throw new Error("Unsupported Swapr output host.");
  }

  return url;
}

async function downloadReplicateOutput({ outputPath, rawUrl }) {
  const url = getSafeReplicateOutputUrl(rawUrl);
  const headers = new Headers();
  const replicateToken = process.env.REPLICATE_API_TOKEN;

  if (url.hostname === "api.replicate.com" && replicateToken) {
    headers.set("Authorization", `Bearer ${replicateToken}`);
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error("Unable to fetch Replicate output.");
  }

  const body = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "video/mp4";

  if (!contentType.startsWith("video/")) {
    throw new Error("Swapr output was not a video.");
  }

  await writeFile(outputPath, body);

  return {
    contentType,
    size: body.byteLength,
  };
}

async function uploadR2Object({ body, client, config, contentType, key }) {
  await client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return {
    key,
    contentType,
    size: body.byteLength,
  };
}

function sanitizeR2KeySegment(segment) {
  const sanitizedSegment = segment
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "");

  if (!sanitizedSegment) {
    throw new Error("R2 object key segment cannot be empty.");
  }

  return sanitizedSegment;
}

function createUserR2KeyPrefix(userId) {
  return `users/${encodeURIComponent(userId)}/`;
}

function createVideoClipObjectKey({ clipId, kind, ownerId }) {
  const baseName = kind === "poster" ? "poster.jpg" : "video.mp4";

  return [
    createUserR2KeyPrefix(ownerId).replace(/\/$/, ""),
    "video-clips",
    sanitizeR2KeySegment(clipId),
    baseName,
  ].join("/");
}

async function createVideoAnalysisProviderJob({
  client,
  clipId,
  clipType,
  config,
  originalName,
  ownerId,
  posterObject,
  productId,
  updatedAt,
  videoObject,
}) {
  await client.mutation(api.providerJobs.createFromMediaWorker, {
    secret: config.mediaWorkerSecret,
    ownerId,
    id: `provider:upload-analysis:${clipId}`,
    jobType: "upload-video-analysis",
    stage: "awaiting-analysis-provider",
    idempotencyKey: `${clipId}:upload-video-analysis`,
    inputSnapshotJson: JSON.stringify({
      clipId,
      clipType,
      originalName,
      posterObject,
      productId,
      sourceSizeBytes: videoObject.size,
      videoObject,
    }),
    createdAt: updatedAt,
  });
}

async function createStitchScoreProviderJob({
  client,
  config,
  ownerId,
  stitchId,
  updatedAt,
}) {
  await client.mutation(api.providerJobs.createFromMediaWorker, {
    secret: config.mediaWorkerSecret,
    ownerId,
    id: `provider:stitch-score:${stitchId}`,
    jobType: "stitch-score-analysis",
    stage: "awaiting-analysis-provider",
    idempotencyKey: `${stitchId}:stitch-score-analysis`,
    inputSnapshotJson: JSON.stringify({ stitchId }),
    createdAt: updatedAt,
  });
}

function getUploadFallbackName(originalName) {
  const withoutExtension = originalName.replace(/\.[^.]+$/, "");
  const normalizedName = withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalizedName || "Uploaded video";
}

function parseCliprFinalizationInput(inputSnapshotJson) {
  const input = JSON.parse(inputSnapshotJson);

  if (!input || typeof input !== "object") {
    throw new Error("Invalid Clipr finalization input.");
  }

  const sourceVideoObject = input.sourceVideoObject;

  if (!sourceVideoObject || typeof sourceVideoObject !== "object") {
    throw new Error("Missing Clipr source video object.");
  }

  return {
    automation: getOptionalAutomationInput(input),
    clipId: getString(input.clipId, "clip ID"),
    clipName: getString(input.clipName, "clip name"),
    cliprJobId: getString(input.cliprJobId, "Clipr job ID"),
    providerJobId:
      typeof input.providerJobId === "string" && input.providerJobId.trim()
        ? input.providerJobId.trim()
        : undefined,
    sourceSummary:
      typeof input.sourceSummary === "string" ? input.sourceSummary : undefined,
    stripAudio: input.stripAudio === true,
    sourceVideoObject: {
      key: getString(sourceVideoObject.key, "source video key"),
      contentType: getString(
        sourceVideoObject.contentType,
        "source video content type",
      ),
      size: getPositiveNumber(sourceVideoObject.size, "source video size"),
    },
  };
}

function parseUploadNormalizationInput(inputSnapshotJson) {
  const input = JSON.parse(inputSnapshotJson);

  if (!input || typeof input !== "object") {
    throw new Error("Invalid upload normalization input.");
  }

  return {
    clipId: getString(input.clipId, "clip ID"),
    clipType: input.clipType === "demo" ? "demo" : "ugc",
    originalName: getString(input.originalName, "original name"),
    productId:
      typeof input.productId === "string" && input.productId.trim()
        ? input.productId.trim()
        : undefined,
    sourceVideoObject: getR2Object(input.sourceVideoObject, "source video"),
  };
}

function parseStitchrDraftFinalizationInput(inputSnapshotJson) {
  const input = JSON.parse(inputSnapshotJson);

  if (!input || typeof input !== "object") {
    throw new Error("Invalid Stitchr export input.");
  }

  return {
    automationDate: getString(input.automationDate, "automation date"),
    automationRunId: getString(input.automationRunId, "automation run ID"),
    automationTaskId: getString(input.automationTaskId, "automation task ID"),
    demoClipId: getString(input.demoClipId, "Demo clip ID"),
    demoClipName: getString(input.demoClipName, "Demo clip name"),
    demoDuration: getPositiveNumber(input.demoDuration, "Demo duration"),
    demoHasAudio: input.demoHasAudio === true,
    demoPlaybackRate: getPlaybackRate(input.demoPlaybackRate),
    demoQuickEdit: readQuickEditSuggestions(input.demoQuickEdit),
    demoTrimRange: getTrimRange(input.demoTrimRange, input.demoDuration),
    demoVideoObject: getR2Object(input.demoVideoObject, "Demo video object"),
    includeDemoAudio: input.includeDemoAudio === true,
    includeUgcAudio: input.includeUgcAudio === true,
    music:
      input.music && typeof input.music === "object" ? input.music : undefined,
    sourceSummary:
      typeof input.sourceSummary === "string" ? input.sourceSummary : undefined,
    socialCaption:
      typeof input.socialCaption === "string" && input.socialCaption.trim()
        ? input.socialCaption.trim()
        : undefined,
    stitchId: getString(input.stitchId, "stitch ID"),
    stitchName: getString(input.stitchName, "stitch name"),
    textOverlay: getOptionalTextOverlay(input.textOverlay),
    ugcClipId: getString(input.ugcClipId, "UGC clip ID"),
    ugcClipName: getString(input.ugcClipName, "UGC clip name"),
    ugcDuration: getPositiveNumber(input.ugcDuration, "UGC duration"),
    ugcHasAudio: input.ugcHasAudio === true,
    ugcPlaybackRate: getPlaybackRate(input.ugcPlaybackRate),
    ugcQuickEdit: readQuickEditSuggestions(input.ugcQuickEdit),
    ugcTrimRange: getTrimRange(input.ugcTrimRange, input.ugcDuration),
    ugcVideoObject: getR2Object(input.ugcVideoObject, "UGC video object"),
  };
}

function getOptionalTextOverlay(value) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return {
    text: getString(value.text, "text overlay text"),
    startTime: getNonNegativeNumber(value.startTime, "text overlay start"),
    endTime: getPositiveFloat(value.endTime, "text overlay end"),
    x: getNonNegativeNumber(value.x, "text overlay x"),
    y: getNonNegativeNumber(value.y, "text overlay y"),
    width: getPositiveFloat(value.width, "text overlay width"),
    fontSize: getPositiveFloat(value.fontSize, "text overlay font size"),
    styleId: getTextOverlayStyleId(value.styleId),
    ...(typeof value.color === "string" ? { color: value.color } : {}),
    ...(typeof value.backgroundColor === "string"
      ? { backgroundColor: value.backgroundColor }
      : {}),
    ...(typeof value.strokeColor === "string"
      ? { strokeColor: value.strokeColor }
      : {}),
  };
}

function getTextOverlayStyleId(value) {
  const styleIds = new Set([
    "clean",
    "hook",
    "caption",
    "serif",
    "mono",
    "badge",
    "outline",
    "luxe",
    "neon",
    "soft",
    "snapchat",
  ]);

  return typeof value === "string" && styleIds.has(value) ? value : "hook";
}

function parseSwaprFinalizationInput(inputSnapshotJson) {
  const input = JSON.parse(inputSnapshotJson);

  if (!input || typeof input !== "object") {
    throw new Error("Invalid Swapr finalization input.");
  }

  const rawSegments = Array.isArray(input.segments) ? input.segments : [];
  const segments = rawSegments.length
    ? rawSegments.map((segment, index) => {
        if (!segment || typeof segment !== "object") {
          throw new Error("Invalid Swapr finalization segment.");
        }

        return {
          index:
            typeof segment.index === "number" && Number.isFinite(segment.index)
              ? Math.trunc(segment.index)
              : index,
          outputUrl: getString(segment.outputUrl, "output URL"),
          predictionId: getString(segment.predictionId, "prediction ID"),
          referenceClipId: getString(
            segment.referenceClipId,
            "reference clip ID",
          ),
          referenceClipName: getString(
            segment.referenceClipName,
            "reference clip name",
          ),
        };
      })
    : [
        {
          index: 0,
          outputUrl: getString(input.outputUrl, "output URL"),
          predictionId: getString(input.predictionId, "prediction ID"),
          referenceClipId: getString(input.referenceClipId, "reference clip ID"),
          referenceClipName: getString(
            input.referenceClipName,
            "reference clip name",
          ),
        },
      ];

  return {
    automation: getOptionalAutomationInput(input),
    characterOrientation: getSwaprCharacterOrientation(
      input.characterOrientation,
    ),
    clipId: getString(input.clipId, "clip ID"),
    clipName: getString(input.clipName, "clip name"),
    keepOriginalSound: input.keepOriginalSound === true,
    mode: getSwaprMode(input.mode),
    modelId: getString(input.modelId, "model ID"),
    productId:
      typeof input.productId === "string" && input.productId.trim()
        ? input.productId.trim()
        : undefined,
    providerJobId:
      typeof input.providerJobId === "string" && input.providerJobId.trim()
        ? input.providerJobId.trim()
        : undefined,
    prompt: typeof input.prompt === "string" ? input.prompt.trim() : undefined,
    referenceClipId: segments[0].referenceClipId,
    referenceClipName: segments[0].referenceClipName,
    segments,
    sourcePhotoId: getString(input.sourcePhotoId, "source photo ID"),
    sourceSummary:
      typeof input.sourceSummary === "string" ? input.sourceSummary : undefined,
  };
}

function getOptionalAutomationInput(input) {
  const automationRunId =
    typeof input.automationRunId === "string" && input.automationRunId.trim()
      ? input.automationRunId.trim()
      : undefined;
  const automationTaskId =
    typeof input.automationTaskId === "string" && input.automationTaskId.trim()
      ? input.automationTaskId.trim()
      : undefined;
  const automationDate =
    typeof input.automationDate === "string" && input.automationDate.trim()
      ? input.automationDate.trim()
      : undefined;

  if (!automationRunId && !automationTaskId && !automationDate) {
    return undefined;
  }

  if (!automationRunId || !automationTaskId || !automationDate) {
    throw new Error("Incomplete automation finalization input.");
  }

  return {
    automationDate,
    automationRunId,
    automationTaskId,
  };
}

function getR2Object(value, label) {
  if (!value || typeof value !== "object") {
    throw new Error(`Missing ${label}.`);
  }

  return {
    key: getString(value.key, `${label} key`),
    contentType: getString(value.contentType, `${label} content type`),
    size: getPositiveNumber(value.size, `${label} size`),
  };
}

function getString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${label}.`);
  }

  return value.trim();
}

function getPositiveNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Missing ${label}.`);
  }

  return Math.ceil(value);
}

function getNonNegativeNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`Missing ${label}.`);
  }

  return value;
}

function getPositiveFloat(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`Missing ${label}.`);
  }

  return value;
}

function getPlaybackRate(value) {
  return value === 2 ? 2 : 1;
}

function getSwaprCharacterOrientation(value) {
  if (value !== "image" && value !== "video") {
    throw new Error("Invalid Swapr character orientation.");
  }

  return value;
}

function getSwaprMode(value) {
  if (value !== "std" && value !== "pro") {
    throw new Error("Invalid Swapr mode.");
  }

  return value;
}

function getTrimRange(value, fallbackDuration) {
  const duration = getPositiveNumber(fallbackDuration, "trim fallback duration");

  if (!value || typeof value !== "object") {
    return { start: 0, end: duration };
  }

  const start = Math.min(
    duration,
    getNonNegativeNumber(value.start, "trim start"),
  );
  const end = Math.min(
    duration,
    Math.max(start, getNonNegativeNumber(value.end, "trim end")),
  );

  return { start, end };
}

async function runFfmpeg(config, args) {
  await execFileAsync(config.ffmpegPath, ["-hide_banner", ...args], {
    maxBuffer: 1024 * 1024 * 16,
  });
}

async function runFfprobe(config, args) {
  const { stdout } = await execFileAsync(config.ffprobePath, args, {
    maxBuffer: 1024 * 1024 * 4,
  });

  return stdout;
}

async function assertFfmpegAvailable(config) {
  await runFfmpeg(config, ["-version"]);
  await runFfprobe(config, ["-version"]);
}

async function normalizeVideo({ config, inputPath, outputPath, stripAudio = false }) {
  const audioArgs = stripAudio
    ? ["-an"]
    : ["-map", "0:a:0?", "-c:a", "aac", "-b:a", "128k"];

  await runFfmpeg(config, [
    "-y",
    "-i",
    inputPath,
    "-map",
    "0:v:0",
    "-vf",
    "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1",
    "-r",
    "30",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    ...audioArgs,
    "-movflags",
    "+faststart",
    outputPath,
  ]);
}

async function createPoster({ config, inputPath, outputPath }) {
  await runFfmpeg(config, [
    "-y",
    "-ss",
    "1",
    "-i",
    inputPath,
    "-frames:v",
    "1",
    "-vf",
    "scale=540:960:force_original_aspect_ratio=increase,crop=540:960,setsar=1",
    "-q:v",
    "3",
    outputPath,
  ]);
}

async function readVideoMetadata({ config, inputPath }) {
  const output = await runFfprobe(config, [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_streams",
    "-show_format",
    inputPath,
  ]);
  const metadata = JSON.parse(output);
  const videoStream = metadata.streams?.find(
    (stream) => stream.codec_type === "video",
  );
  const hasAudio = metadata.streams?.some(
    (stream) => stream.codec_type === "audio",
  );

  if (!videoStream?.width || !videoStream?.height) {
    throw new Error("Unable to read normalized video dimensions.");
  }

  const duration = Number(metadata.format?.duration || videoStream.duration);

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Unable to read normalized video duration.");
  }

  return {
    aspectRatio: videoStream.width / videoStream.height,
    duration,
    hasAudio: Boolean(hasAudio),
    height: videoStream.height,
    width: videoStream.width,
  };
}

async function processCliprFinalization({ client, config, job, r2 }) {
  const input = parseCliprFinalizationInput(job.inputSnapshotJson);
  const scratchDir = join(config.scratchDir, sanitizeR2KeySegment(job.id));
  const sourcePath = join(scratchDir, "source.mp4");
  const outputPath = join(scratchDir, "normalized.mp4");
  const posterPath = join(scratchDir, "poster.jpg");

  await mkdir(scratchDir, { recursive: true });

  try {
    await client.mutation(api.mediaJobs.markStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: job.id,
      status: "running",
      stage: "downloading-source",
      updatedAt: new Date().toISOString(),
    });
    await downloadR2Object({
      client: r2,
      config,
      key: input.sourceVideoObject.key,
      outputPath: sourcePath,
    });
    await client.mutation(api.mediaJobs.markStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: job.id,
      status: "running",
      stage: "normalizing",
      updatedAt: new Date().toISOString(),
    });
    await normalizeVideo({
      config,
      inputPath: sourcePath,
      outputPath,
      stripAudio: input.stripAudio,
    });
    await createPoster({ config, inputPath: outputPath, outputPath: posterPath });

    const [videoBody, posterBody] = await Promise.all([
      readFile(outputPath),
      readFile(posterPath),
    ]);
    const metadata = await readVideoMetadata({ config, inputPath: outputPath });
    const [videoObject, posterObject] = await Promise.all([
      uploadR2Object({
        body: videoBody,
        client: r2,
        config,
        contentType: "video/mp4",
        key: createVideoClipObjectKey({
          clipId: input.clipId,
          kind: "video",
          ownerId: job.ownerId,
        }),
      }),
      uploadR2Object({
        body: posterBody,
        client: r2,
        config,
        contentType: "image/jpeg",
        key: createVideoClipObjectKey({
          clipId: input.clipId,
          kind: "poster",
          ownerId: job.ownerId,
        }),
      }),
    ]);
    const updatedAt = new Date().toISOString();
    const clipId = await client.mutation(
      api.cliprJobs.finalizeWithClipFromMediaWorker,
      {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: input.cliprJobId,
        clipId: input.clipId,
        name: input.clipName,
        videoObject,
        posterObject,
        posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
        mimeType: videoObject.contentType,
        sourceMimeType: input.sourceVideoObject.contentType,
        size: videoObject.size,
        originalSize: input.sourceVideoObject.size,
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.aspectRatio,
        duration: metadata.duration,
        hasAudio: metadata.hasAudio,
        ...(input.automation
          ? {
              automation: {
                source: "automation",
                runId: input.automation.automationRunId,
                taskId: input.automation.automationTaskId,
                tool: "clipr",
                automationDate: input.automation.automationDate,
                sourceSummary: input.sourceSummary,
              },
            }
          : {}),
        updatedAt,
      },
    );

    await createVideoAnalysisProviderJob({
      client,
      clipId: input.clipId,
      clipType: "ugc",
      config,
      originalName: `${input.clipName}.mp4`,
      ownerId: job.ownerId,
      posterObject,
      updatedAt,
      videoObject,
    });

    if (input.automation) {
      await client.mutation(api.automationTasks.markMediaStatus, {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: input.automation.automationTaskId,
        status: "completed",
        stage: "completed",
        outputAssetId: clipId,
        mediaJobId: job.id,
        updatedAt,
      });
      await client.mutation(api.automationRuns.markMediaStatus, {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: input.automation.automationRunId,
        status: "completed",
        updatedAt,
      });
    }
    if (input.providerJobId) {
      await client.mutation(api.providerJobs.markMediaStatus, {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: input.providerJobId,
        status: "completed",
        stage: "completed",
        outputAssetId: clipId,
        mediaJobId: job.id,
        progress: 1,
        updatedAt,
      });
    }
    await client.mutation(api.mediaJobs.markStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: job.id,
      status: "completed",
      stage: "completed",
      outputAssetId: clipId,
      updatedAt,
    });
  } finally {
    await rm(scratchDir, { force: true, recursive: true });
  }
}

async function processUploadNormalization({ client, config, job, r2 }) {
  const input = parseUploadNormalizationInput(job.inputSnapshotJson);
  const scratchDir = join(config.scratchDir, sanitizeR2KeySegment(job.id));
  const sourcePath = join(scratchDir, "source");
  const outputPath = join(scratchDir, "normalized.mp4");
  const posterPath = join(scratchDir, "poster.jpg");

  await mkdir(scratchDir, { recursive: true });

  try {
    await client.mutation(api.mediaJobs.markStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: job.id,
      status: "running",
      stage: "downloading-source",
      updatedAt: new Date().toISOString(),
    });
    await downloadR2Object({
      client: r2,
      config,
      key: input.sourceVideoObject.key,
      outputPath: sourcePath,
    });

    await client.mutation(api.mediaJobs.markStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: job.id,
      status: "running",
      stage: "normalizing",
      updatedAt: new Date().toISOString(),
    });
    await normalizeVideo({ config, inputPath: sourcePath, outputPath });
    await createPoster({ config, inputPath: outputPath, outputPath: posterPath });

    const [videoBody, posterBody] = await Promise.all([
      readFile(outputPath),
      readFile(posterPath),
    ]);
    const metadata = await readVideoMetadata({ config, inputPath: outputPath });
    const [videoObject, posterObject] = await Promise.all([
      uploadR2Object({
        body: videoBody,
        client: r2,
        config,
        contentType: "video/mp4",
        key: createVideoClipObjectKey({
          clipId: input.clipId,
          kind: "video",
          ownerId: job.ownerId,
        }),
      }),
      uploadR2Object({
        body: posterBody,
        client: r2,
        config,
        contentType: "image/jpeg",
        key: createVideoClipObjectKey({
          clipId: input.clipId,
          kind: "poster",
          ownerId: job.ownerId,
        }),
      }),
    ]);
    const updatedAt = new Date().toISOString();

    await client.mutation(api.videoClips.saveFromMediaWorker, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: input.clipId,
      name: getUploadFallbackName(input.originalName),
      tags: [input.clipType],
      originalName: input.originalName,
      clipType: input.clipType,
      videoObject,
      posterObject,
      posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
      mimeType: videoObject.contentType,
      sourceMimeType: input.sourceVideoObject.contentType,
      size: videoObject.size,
      originalSize: input.sourceVideoObject.size,
      width: metadata.width,
      height: metadata.height,
      aspectRatio: metadata.aspectRatio,
      duration: metadata.duration,
      defaultTrimRange: {
        start: 0,
        end: metadata.duration,
      },
      hasAudio: metadata.hasAudio,
      productId: input.productId,
      createdAt: updatedAt,
      updatedAt,
    });

    await createVideoAnalysisProviderJob({
      client,
      clipId: input.clipId,
      clipType: input.clipType,
      config,
      originalName: input.originalName,
      ownerId: job.ownerId,
      posterObject,
      productId: input.productId,
      updatedAt,
      videoObject,
    });

    await client.mutation(api.mediaJobs.markStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: job.id,
      status: "completed",
      stage: "completed",
      outputAssetId: input.clipId,
      updatedAt,
    });
  } finally {
    await rm(scratchDir, { force: true, recursive: true });
  }
}

async function processStitchrDraftFinalization({ client, config, job }) {
  const input = parseStitchrDraftFinalizationInput(job.inputSnapshotJson);
  const updatedAt = new Date().toISOString();
  const duration =
    getQuickEditPlaybackDuration({
      duration: input.ugcDuration,
      playbackRate: input.ugcPlaybackRate,
      removeRanges: input.ugcQuickEdit?.removeRanges,
      trimRange: input.ugcTrimRange,
    }) +
    getQuickEditPlaybackDuration({
      duration: input.demoDuration,
      playbackRate: input.demoPlaybackRate,
      removeRanges: input.demoQuickEdit?.removeRanges,
      trimRange: input.demoTrimRange,
    });

  await client.mutation(api.mediaJobs.markStatus, {
    secret: config.mediaWorkerSecret,
    ownerId: job.ownerId,
    id: job.id,
    status: "running",
    stage: "saving-editable-stitch",
    updatedAt,
  });
  await client.mutation(api.stitches.saveFromMediaWorker, {
    secret: config.mediaWorkerSecret,
    ownerId: job.ownerId,
    automation: {
      source: "automation",
      runId: input.automationRunId,
      taskId: input.automationTaskId,
      tool: "stitchr",
      automationDate: input.automationDate,
      sourceSummary: input.sourceSummary,
    },
    id: input.stitchId,
    mode: "normal",
    name: input.stitchName,
    ugcClipId: input.ugcClipId,
    demoClipId: input.demoClipId,
    ugcClipName: input.ugcClipName,
    demoClipName: input.demoClipName,
    ugcTrimRange: input.ugcTrimRange,
    demoTrimRange: input.demoTrimRange,
    width: TIKTOK_OUTPUT_WIDTH,
    height: TIKTOK_OUTPUT_HEIGHT,
    duration,
    includeDemoAudio: input.includeDemoAudio,
    includeUgcAudio: input.includeUgcAudio,
    ...(input.music ? { music: input.music } : {}),
    demoPlaybackRate: input.demoPlaybackRate,
    ugcPlaybackRate: input.ugcPlaybackRate,
    ...(input.demoQuickEdit ? { demoQuickEdit: input.demoQuickEdit } : {}),
    ...(input.socialCaption ? { socialCaption: input.socialCaption } : {}),
    ...(input.textOverlay ? { textOverlay: input.textOverlay } : {}),
    ...(input.ugcQuickEdit ? { ugcQuickEdit: input.ugcQuickEdit } : {}),
    createdAt: updatedAt,
  });
  await createStitchScoreProviderJob({
    client,
    config,
    ownerId: job.ownerId,
    stitchId: input.stitchId,
    updatedAt,
  });
  await client.mutation(api.automationStitchr.recordOutputFromMediaWorker, {
    secret: config.mediaWorkerSecret,
    ownerId: job.ownerId,
    taskId: input.automationTaskId,
    ugcClipId: input.ugcClipId,
    demoClipId: input.demoClipId,
    stitchId: input.stitchId,
    mediaJobId: job.id,
    automationDate: input.automationDate,
    completedAt: updatedAt,
  });
  await client.mutation(api.mediaJobs.markStatus, {
    secret: config.mediaWorkerSecret,
    ownerId: job.ownerId,
    id: job.id,
    status: "completed",
    stage: "completed",
    outputAssetId: input.stitchId,
    updatedAt,
  });
}

async function processSwaprFinalization({ client, config, job, r2 }) {
  const input = parseSwaprFinalizationInput(job.inputSnapshotJson);
  const scratchDir = join(config.scratchDir, sanitizeR2KeySegment(job.id));
  const outputPath = join(scratchDir, "normalized.mp4");
  const posterPath = join(scratchDir, "poster.jpg");

  await mkdir(scratchDir, { recursive: true });

  try {
    await client.mutation(api.mediaJobs.markStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: job.id,
      status: "running",
      stage: "downloading-provider-output",
      updatedAt: new Date().toISOString(),
    });

    const sourceObjects = [];
    const normalizedPaths = [];

    for (const segment of input.segments) {
      const sourcePath = join(scratchDir, `source-${segment.index}.mp4`);
      const normalizedPath = join(scratchDir, `normalized-${segment.index}.mp4`);
      const sourceObject = await downloadReplicateOutput({
        outputPath: sourcePath,
        rawUrl: segment.outputUrl,
      });

      sourceObjects.push(sourceObject);

      await client.mutation(api.mediaJobs.markStatus, {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: job.id,
        status: "running",
        stage: "normalizing",
        updatedAt: new Date().toISOString(),
      });
      await normalizeVideo({
        config,
        inputPath: sourcePath,
        outputPath: normalizedPath,
      });
      normalizedPaths.push(normalizedPath);
    }

    if (normalizedPaths.length === 1) {
      await runFfmpeg(config, [
        "-y",
        "-i",
        normalizedPaths[0],
        "-c",
        "copy",
        outputPath,
      ]);
    } else {
      const concatListPath = join(scratchDir, "concat.txt");
      const concatList = normalizedPaths
        .map((path) => `file '${path.replace(/'/g, "'\\''")}'`)
        .join("\n");

      await client.mutation(api.mediaJobs.markStatus, {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: job.id,
        status: "running",
        stage: "stitching",
        updatedAt: new Date().toISOString(),
      });
      await writeFile(concatListPath, concatList);
      await runFfmpeg(config, [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatListPath,
        "-c",
        "copy",
        outputPath,
      ]);
    }

    await createPoster({ config, inputPath: outputPath, outputPath: posterPath });

    const [videoBody, posterBody] = await Promise.all([
      readFile(outputPath),
      readFile(posterPath),
    ]);
    const metadata = await readVideoMetadata({ config, inputPath: outputPath });
    const [videoObject, posterObject] = await Promise.all([
      uploadR2Object({
        body: videoBody,
        client: r2,
        config,
        contentType: "video/mp4",
        key: createVideoClipObjectKey({
          clipId: input.clipId,
          kind: "video",
          ownerId: job.ownerId,
        }),
      }),
      uploadR2Object({
        body: posterBody,
        client: r2,
        config,
        contentType: "image/jpeg",
        key: createVideoClipObjectKey({
          clipId: input.clipId,
          kind: "poster",
          ownerId: job.ownerId,
        }),
      }),
    ]);
    const updatedAt = new Date().toISOString();
    await client.mutation(api.videoClips.saveFromMediaWorker, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      ...(input.automation
        ? {
            automation: {
              source: "automation",
              runId: input.automation.automationRunId,
              taskId: input.automation.automationTaskId,
              tool: "swapr",
              automationDate: input.automation.automationDate,
              sourceSummary: input.sourceSummary,
            },
          }
        : {}),
      id: input.clipId,
      name: input.clipName,
      tags: [],
      originalName: `${input.clipName}.mp4`,
      clipType: "ugc",
      videoObject,
      posterObject,
      posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
      mimeType: videoObject.contentType,
      sourceMimeType: sourceObjects[0]?.contentType ?? "video/mp4",
      size: videoObject.size,
      originalSize: sourceObjects.reduce(
        (totalSize, sourceObject) => totalSize + sourceObject.size,
        0,
      ),
      width: metadata.width,
      height: metadata.height,
      aspectRatio: metadata.aspectRatio,
      duration: metadata.duration,
      defaultTrimRange: {
        start: 0,
        end: metadata.duration,
      },
      hasAudio: metadata.hasAudio,
      productId: input.productId,
      swaprMetadata: {
        source: "swapr",
        sourcePhotoId: input.sourcePhotoId,
        referenceUgcClipId: input.referenceClipId,
        replicatePredictionId: input.segments[0].predictionId,
        replicatePredictionIds: input.segments.map(
          (segment) => segment.predictionId,
        ),
        sourceSegmentCount: input.segments.length,
        modelId: input.modelId,
        mode: input.mode,
        characterOrientation: input.characterOrientation,
        prompt: input.prompt || undefined,
        keepOriginalSound: input.keepOriginalSound,
      },
      createdAt: updatedAt,
      updatedAt,
    });
    await createVideoAnalysisProviderJob({
      client,
      clipId: input.clipId,
      clipType: "ugc",
      config,
      originalName: `${input.clipName}.mp4`,
      ownerId: job.ownerId,
      posterObject,
      productId: input.productId,
      updatedAt,
      videoObject,
    });
    if (input.automation) {
      await client.mutation(api.automationTasks.markMediaStatus, {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: input.automation.automationTaskId,
        status: "completed",
        stage: "completed",
        outputAssetId: input.clipId,
        mediaJobId: job.id,
        updatedAt,
      });
      await client.mutation(api.automationRuns.markMediaStatus, {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: input.automation.automationRunId,
        status: "completed",
        updatedAt,
      });
    }
    if (input.providerJobId) {
      await client.mutation(api.providerJobs.markMediaStatus, {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: input.providerJobId,
        status: "completed",
        stage: "completed",
        outputAssetId: input.clipId,
        mediaJobId: job.id,
        progress: 1,
        updatedAt,
      });
    }
    await client.mutation(api.mediaJobs.markStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: job.id,
      status: "completed",
      stage: "completed",
      outputAssetId: input.clipId,
      updatedAt,
    });
  } finally {
    await rm(scratchDir, { force: true, recursive: true });
  }
}

function getAutomationMediaJobFailureInput(job) {
  if (
    job.jobType !== "clipr-finalization" &&
    job.jobType !== "stitchr-draft-finalization" &&
    job.jobType !== "swapr-finalization"
  ) {
    return null;
  }

  const input = JSON.parse(job.inputSnapshotJson);

  if (!input || typeof input !== "object") {
    return null;
  }

  return {
    automationRunId: getString(input.automationRunId, "automation run ID"),
    automationTaskId: getString(input.automationTaskId, "automation task ID"),
    cliprJobId:
      typeof input.cliprJobId === "string" && input.cliprJobId.trim()
        ? input.cliprJobId
        : undefined,
  };
}

function getProviderMediaJobFailureInput(job) {
  if (job.jobType !== "clipr-finalization" && job.jobType !== "swapr-finalization") {
    return null;
  }

  const input = JSON.parse(job.inputSnapshotJson);

  if (!input || typeof input !== "object") {
    return null;
  }

  return typeof input.providerJobId === "string" && input.providerJobId.trim()
    ? { providerJobId: input.providerJobId.trim() }
    : null;
}

async function failAutomationMediaJob({
  client,
  config,
  error,
  job,
  message,
  updatedAt,
}) {
  let input = null;

  try {
    input = getAutomationMediaJobFailureInput(job);
  } catch {
    return;
  }

  if (!input) {
    return;
  }

  const mutations = [
    client.mutation(api.automationTasks.markMediaStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: input.automationTaskId,
      status: "failed",
      stage: "media-finalization-failed",
      error: message,
      updatedAt,
    }),
    client.mutation(api.automationRuns.markMediaStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: input.automationRunId,
      status: "failed",
      error: message,
      updatedAt,
    }),
  ];

  if (job.jobType === "clipr-finalization" && input.cliprJobId) {
    mutations.push(
      client.mutation(api.cliprJobs.failFromMediaWorker, {
        secret: config.mediaWorkerSecret,
        ownerId: job.ownerId,
        id: input.cliprJobId,
        error,
        updatedAt,
      }),
    );
  }

  await Promise.all(mutations.map((mutation) => mutation.catch(() => null)));
}

async function failProviderMediaJob({
  client,
  config,
  job,
  message,
  updatedAt,
}) {
  let input = null;

  try {
    input = getProviderMediaJobFailureInput(job);
  } catch {
    return;
  }

  if (!input) {
    return;
  }

  await client
    .mutation(api.providerJobs.markMediaStatus, {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      id: input.providerJobId,
      status: "failed",
      stage: "media-finalization-failed",
      error: message,
      mediaJobId: job.id,
      updatedAt,
    })
    .catch(() => null);
}

async function failJob({ client, config, error, job }) {
  const message =
    error instanceof Error ? error.message : "Unable to process media job.";
  const retry = job.attempt < MEDIA_MAX_JOB_ATTEMPTS;
  const updatedAt = new Date().toISOString();

  await client.mutation(api.mediaJobs.markStatus, {
    secret: config.mediaWorkerSecret,
    ownerId: job.ownerId,
    id: job.id,
    status: retry ? "queued" : "failed",
    stage: retry ? "retry-queued" : "failed",
    error: message,
    updatedAt,
  });

  if (!retry) {
    await Promise.all([
      failAutomationMediaJob({
        client,
        config,
        error: message,
        job,
        message,
        updatedAt,
      }),
      failProviderMediaJob({
        client,
        config,
        job,
        message,
        updatedAt,
      }),
    ]);
  }
}

async function processJob({ client, config, job, r2 }) {
  if (job.jobType === "upload-normalization") {
    await processUploadNormalization({ client, config, job, r2 });
    return;
  }

  if (job.jobType === "clipr-finalization") {
    await processCliprFinalization({ client, config, job, r2 });
    return;
  }

  if (job.jobType === "stitchr-draft-finalization") {
    await processStitchrDraftFinalization({ client, config, job });
    return;
  }

  if (job.jobType === "swapr-finalization") {
    await processSwaprFinalization({ client, config, job, r2 });
    return;
  }

  throw new Error(`Unsupported media job type: ${job.jobType}.`);
}

async function claimNextJob({ client, config }) {
  const now = new Date();
  const lockedUntil = new Date(now.getTime() + config.lockMs).toISOString();

  return await client.mutation(api.mediaJobs.claimNext, {
    secret: config.mediaWorkerSecret,
    workerId: config.workerId,
    lockedUntil,
    updatedAt: now.toISOString(),
  });
}

async function runOnce({ client, config, maxJobs, r2 }) {
  let processedCount = 0;

  while (processedCount < maxJobs) {
    const job = await claimNextJob({ client, config });

    if (!job) {
      break;
    }

    try {
      await processJob({ client, config, job, r2 });
    } catch (error) {
      await failJob({ client, config, error, job });
      throw error;
    }

    processedCount += 1;
  }

  return processedCount;
}

async function runLoop({ client, config, r2 }) {
  for (;;) {
    const processedCount = await runOnce({
      client,
      config,
      maxJobs: 1,
      r2,
    });

    if (processedCount === 0) {
      await new Promise((resolve) => setTimeout(resolve, config.pollIntervalMs));
    }
  }
}

async function requestMediaWorkerContinuation({ client, config }) {
  await client.mutation(api.mediaWorkerLaunch.requestContinuation, {
    secret: config.mediaWorkerSecret,
    requestedAt: new Date().toISOString(),
  });
}

async function main() {
  await loadWorkerEnv();

  const args = readArgs();
  const config = getConfig();

  await assertFfmpegAvailable(config);

  if (args.check) {
    console.log("Media worker FFmpeg check passed.");
    return;
  }

  const client = new ConvexHttpClient(config.convexUrl);
  const r2 = createR2Client(config);

  if (args.once) {
    const processedCount = await runOnce({
      client,
      config,
      maxJobs: args.maxJobs,
      r2,
    });

    if (processedCount === args.maxJobs) {
      await requestMediaWorkerContinuation({ client, config });
    }

    console.log(`Media worker processed ${processedCount} job(s).`);
    return;
  }

  await runLoop({ client, config, r2 });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
