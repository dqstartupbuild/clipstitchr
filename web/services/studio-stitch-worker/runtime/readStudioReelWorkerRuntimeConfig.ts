import type { StudioReelWorkerRuntimeConfig } from "../contracts/StudioReelWorkerRuntimeConfig";
import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";
import { getStudioReelWorkerRuntimeCheck } from "./getStudioReelWorkerRuntimeCheck";
import { readStudioReelDansUgcDownloadHosts } from "./readStudioReelDansUgcDownloadHosts";
import { readOptionalStudioReelWorkerEnvironmentValue } from "./readOptionalStudioReelWorkerEnvironmentValue";
import { readStudioReelWorkerInteger } from "./readStudioReelWorkerInteger";

export function readStudioReelWorkerRuntimeConfig(
  environment: NodeJS.ProcessEnv,
): StudioReelWorkerRuntimeConfig {
  const check = getStudioReelWorkerRuntimeCheck(environment);
  if (!check.ready) {
    throw new StudioReelWorkerError({
      code: "WORKER_CONFIGURATION_UNAVAILABLE",
      kind: "permanent",
      publicMessage:
        "Studio Stitch execution is disabled or its required worker configuration is unavailable.",
    });
  }
  const origin = new URL(environment.STUDIO_STITCH_WORKER_API_ORIGIN!.trim());
  if (
    !(
      origin.protocol === "https:" ||
      (origin.protocol === "http:" &&
        (origin.hostname === "localhost" || origin.hostname === "127.0.0.1"))
    ) ||
    origin.username ||
    origin.password ||
    origin.search ||
    origin.hash
  ) {
    throw new StudioReelWorkerError({
      code: "INVALID_COORDINATOR_ORIGIN",
      kind: "permanent",
      publicMessage: "The Studio Stitch coordinator origin is invalid.",
    });
  }
  origin.pathname = origin.pathname.replace(/\/$/, "");
  return {
    commands: {
      ffmpegPath: environment.STUDIO_STITCH_FFMPEG_PATH?.trim() || "ffmpeg",
      ffprobePath: environment.STUDIO_STITCH_FFPROBE_PATH?.trim() || "ffprobe",
      fontPath:
        environment.STUDIO_STITCH_FONT_PATH?.trim() ||
        "/app/services/studio-stitch-worker/assets/TikTokSans-Regular.ttf",
    },
    coordinator: {
      origin: origin.toString().replace(/\/$/, ""),
      requestTimeoutMs: readStudioReelWorkerInteger({
        fallback: 30_000,
        maximum: 120_000,
        minimum: 1_000,
        name: "STUDIO_STITCH_WORKER_HTTP_TIMEOUT_MS",
        value: environment.STUDIO_STITCH_WORKER_HTTP_TIMEOUT_MS,
      }),
      secret: environment.STUDIO_STITCH_WORKER_SECRET!.trim(),
    },
    leaseSeconds: readStudioReelWorkerInteger({
      fallback: 300,
      maximum: 900,
      minimum: 30,
      name: "STUDIO_STITCH_WORKER_LEASE_SECONDS",
      value: environment.STUDIO_STITCH_WORKER_LEASE_SECONDS,
    }),
    pollIntervalMs: readStudioReelWorkerInteger({
      fallback: 2_000,
      maximum: 60_000,
      minimum: 250,
      name: "STUDIO_STITCH_WORKER_POLL_INTERVAL_MS",
      value: environment.STUDIO_STITCH_WORKER_POLL_INTERVAL_MS,
    }),
    providers: {
      ...(readOptionalStudioReelWorkerEnvironmentValue(environment.DANSUGC_API_KEY)
        ? { dansugcApiKey: readOptionalStudioReelWorkerEnvironmentValue(environment.DANSUGC_API_KEY) }
        : {}),
      ...(readOptionalStudioReelWorkerEnvironmentValue(environment.ELEVENLABS_API_KEY)
        ? { elevenLabsApiKey: readOptionalStudioReelWorkerEnvironmentValue(environment.ELEVENLABS_API_KEY) }
        : {}),
      ...(readOptionalStudioReelWorkerEnvironmentValue(environment.GEMINI_API_KEY)
        ? { geminiApiKey: readOptionalStudioReelWorkerEnvironmentValue(environment.GEMINI_API_KEY) }
        : {}),
      dansugcDownloadHosts: readStudioReelDansUgcDownloadHosts(
        environment.STUDIO_STITCH_DANSUGC_DOWNLOAD_HOSTS,
      ),
    },
    r2: {
      accessKeyId: environment.R2_ACCESS_KEY_ID!.trim(),
      accountId: environment.R2_ACCOUNT_ID!.trim(),
      bucketName: environment.R2_BUCKET_NAME!.trim(),
      secretAccessKey: environment.R2_SECRET_ACCESS_KEY!.trim(),
    },
    ...(readOptionalStudioReelWorkerEnvironmentValue(
      environment.STUDIO_STITCH_WORKER_SCRATCH_ROOT,
    )
      ? {
          scratchRoot: readOptionalStudioReelWorkerEnvironmentValue(
            environment.STUDIO_STITCH_WORKER_SCRATCH_ROOT,
          ),
        }
      : {}),
    workerId:
      environment.STUDIO_STITCH_WORKER_ID?.trim() ||
      `studio-stitch-worker-${process.pid}`,
  };
}
