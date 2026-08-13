import { STUDIO_REEL_WORKER_CONTRACT_VERSION } from "../constants/studioReelWorkerContractVersion";
import type { StudioReelWorkerRuntimeCheck } from "../contracts/StudioReelWorkerRuntimeCheck";

const required = [
  "STUDIO_BETA_ENABLED",
  "STUDIO_STITCH_EXECUTION_ENABLED",
  "STUDIO_STITCH_WORKER_API_ORIGIN",
  "STUDIO_STITCH_WORKER_SECRET",
  "R2_ACCOUNT_ID",
  "R2_BUCKET_NAME",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
] as const;

export function getStudioReelWorkerRuntimeCheck(
  environment: NodeJS.ProcessEnv,
): StudioReelWorkerRuntimeCheck {
  const missingEnvironment = required.filter((name) => {
    const value = environment[name]?.trim() ?? "";
    return (
      value.length === 0 ||
      ((name === "STUDIO_BETA_ENABLED" ||
        name === "STUDIO_STITCH_EXECUTION_ENABLED") &&
        value !== "true") ||
      (name === "STUDIO_STITCH_WORKER_SECRET" && value.length < 32)
    );
  });
  const enabled =
    environment.STUDIO_BETA_ENABLED === "true" &&
    environment.STUDIO_STITCH_EXECUTION_ENABLED === "true";
  return {
    contractVersion: STUDIO_REEL_WORKER_CONTRACT_VERSION,
    enabled,
    missingEnvironment,
    providers: {
      dansugc: Boolean(
        environment.DANSUGC_API_KEY?.trim() &&
          environment.STUDIO_STITCH_DANSUGC_DOWNLOAD_HOSTS?.trim(),
      ),
      elevenlabs: Boolean(environment.ELEVENLABS_API_KEY?.trim()),
      gemini: Boolean(environment.GEMINI_API_KEY?.trim()),
      render: true,
    },
    ready: enabled && missingEnvironment.length === 0,
    requiredCommands: [
      environment.STUDIO_STITCH_FFMPEG_PATH?.trim() || "ffmpeg",
      environment.STUDIO_STITCH_FFPROBE_PATH?.trim() || "ffprobe",
    ],
  };
}
