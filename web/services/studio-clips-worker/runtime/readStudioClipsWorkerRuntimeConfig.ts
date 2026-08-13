import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import type { StudioClipsWorkerRuntimeConfig } from "./StudioClipsWorkerRuntimeConfig";
import { getStudioClipsWorkerRuntimePreflight } from "./getStudioClipsWorkerRuntimePreflight";
import { readStudioClipsBoundedEnvironmentInteger } from "./readStudioClipsBoundedEnvironmentInteger";

export function readStudioClipsWorkerRuntimeConfig(
  environment: NodeJS.ProcessEnv,
): StudioClipsWorkerRuntimeConfig {
  const preflight = getStudioClipsWorkerRuntimePreflight(environment);
  if (preflight.required.state === "unavailable") {
    const names = [
      ...preflight.required.missingEnvironment,
      ...preflight.required.invalidEnvironment,
    ].join(", ");
    throw new StudioClipsWorkerError({
      code: "WORKER_CONFIGURATION_UNAVAILABLE",
      kind: "permanent",
      publicMessage: `Studio Clips worker configuration is unavailable: ${names}.`,
    });
  }

  const provider = environment.STUDIO_CLIPS_ANALYSIS_PROVIDER!.trim() as
    | "google"
    | "openai";
  const origin = new URL(environment.STUDIO_CLIPS_WORKER_API_ORIGIN!.trim());
  origin.pathname = origin.pathname.replace(/\/$/, "");

  return {
    analysis: {
      apiKey:
        provider === "google"
          ? environment.GOOGLE_API_KEY!.trim()
          : environment.OPENAI_API_KEY!.trim(),
      model: environment.STUDIO_CLIPS_ANALYSIS_MODEL!.trim(),
      provider,
    },
    assemblyAi: {
      apiKey: environment.ASSEMBLYAI_API_KEY!.trim(),
      pollIntervalMs: readStudioClipsBoundedEnvironmentInteger(
        environment.STUDIO_CLIPS_ASSEMBLYAI_POLL_INTERVAL_MS,
        3_000,
        500,
        30_000,
        "STUDIO_CLIPS_ASSEMBLYAI_POLL_INTERVAL_MS",
      ),
      timeoutMs: readStudioClipsBoundedEnvironmentInteger(
        environment.STUDIO_CLIPS_ASSEMBLYAI_TIMEOUT_MS,
        1_800_000,
        30_000,
        3_600_000,
        "STUDIO_CLIPS_ASSEMBLYAI_TIMEOUT_MS",
      ),
    },
    ...(environment.PEXELS_API_KEY?.trim()
      ? { broll: { apiKey: environment.PEXELS_API_KEY.trim() } }
      : {}),
    commands: {
      builtInFontsDirectory:
        environment.STUDIO_CLIPS_BUILT_IN_FONTS_DIRECTORY?.trim() ||
        "vendor/supoclip/v0_1_0/upstream/backend/fonts",
      ffmpegPath: environment.STUDIO_CLIPS_FFMPEG_PATH?.trim() || "ffmpeg",
      ffprobePath: environment.STUDIO_CLIPS_FFPROBE_PATH?.trim() || "ffprobe",
      ytDlpPath: environment.STUDIO_CLIPS_YT_DLP_PATH?.trim() || "yt-dlp",
    },
    coordinator: {
      origin: origin.toString().replace(/\/$/, ""),
      requestTimeoutMs: readStudioClipsBoundedEnvironmentInteger(
        environment.STUDIO_CLIPS_WORKER_HTTP_TIMEOUT_MS,
        30_000,
        1_000,
        120_000,
        "STUDIO_CLIPS_WORKER_HTTP_TIMEOUT_MS",
      ),
      secret: environment.STUDIO_CLIPS_WORKER_SECRET!.trim(),
    },
    leaseSeconds: readStudioClipsBoundedEnvironmentInteger(
      environment.STUDIO_CLIPS_WORKER_LEASE_SECONDS,
      300,
      30,
      900,
      "STUDIO_CLIPS_WORKER_LEASE_SECONDS",
    ),
    pollIntervalMs: readStudioClipsBoundedEnvironmentInteger(
      environment.STUDIO_CLIPS_WORKER_POLL_INTERVAL_MS,
      2_000,
      250,
      60_000,
      "STUDIO_CLIPS_WORKER_POLL_INTERVAL_MS",
    ),
    r2: {
      accessKeyId: environment.R2_ACCESS_KEY_ID!.trim(),
      accountId: environment.R2_ACCOUNT_ID!.trim(),
      bucketName: environment.R2_BUCKET_NAME!.trim(),
      secretAccessKey: environment.R2_SECRET_ACCESS_KEY!.trim(),
    },
    ...(environment.STUDIO_CLIPS_WORKER_SCRATCH_ROOT?.trim()
      ? { scratchRoot: environment.STUDIO_CLIPS_WORKER_SCRATCH_ROOT.trim() }
      : {}),
    workerId:
      environment.STUDIO_CLIPS_WORKER_ID?.trim() ||
      `studio-clips-worker-${process.pid}`,
  };
}
