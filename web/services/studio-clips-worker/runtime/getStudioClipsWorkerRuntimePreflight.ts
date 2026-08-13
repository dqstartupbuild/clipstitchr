import type { StudioClipsWorkerRuntimePreflight } from "./StudioClipsWorkerRuntimePreflight";

const requiredNames = [
  "ASSEMBLYAI_API_KEY",
  "R2_ACCESS_KEY_ID",
  "R2_ACCOUNT_ID",
  "R2_BUCKET_NAME",
  "R2_SECRET_ACCESS_KEY",
  "STUDIO_CLIPS_ANALYSIS_MODEL",
  "STUDIO_CLIPS_ANALYSIS_PROVIDER",
  "STUDIO_CLIPS_WORKER_API_ORIGIN",
  "STUDIO_CLIPS_WORKER_QUEUE_ENABLED",
  "STUDIO_CLIPS_WORKER_SECRET",
  "STUDIO_BETA_ENABLED",
] as const;

export function getStudioClipsWorkerRuntimePreflight(
  environment: NodeJS.ProcessEnv,
): StudioClipsWorkerRuntimePreflight {
  const missingEnvironment: string[] = requiredNames.filter(
    (name) => !environment[name]?.trim(),
  );
  const provider = environment.STUDIO_CLIPS_ANALYSIS_PROVIDER?.trim();

  if (provider === "google" && !environment.GOOGLE_API_KEY?.trim()) {
    missingEnvironment.push("GOOGLE_API_KEY");
  }
  if (provider === "openai" && !environment.OPENAI_API_KEY?.trim()) {
    missingEnvironment.push("OPENAI_API_KEY");
  }

  const invalidEnvironment: string[] = [];

  if (provider && provider !== "google" && provider !== "openai") {
    invalidEnvironment.push("STUDIO_CLIPS_ANALYSIS_PROVIDER");
  }

  if (
    environment.STUDIO_BETA_ENABLED !== undefined &&
    environment.STUDIO_BETA_ENABLED !== "true"
  ) {
    invalidEnvironment.push("STUDIO_BETA_ENABLED");
  }

  if (
    environment.STUDIO_CLIPS_WORKER_QUEUE_ENABLED !== undefined &&
    environment.STUDIO_CLIPS_WORKER_QUEUE_ENABLED !== "true"
  ) {
    invalidEnvironment.push("STUDIO_CLIPS_WORKER_QUEUE_ENABLED");
  }

  const workerSecret = environment.STUDIO_CLIPS_WORKER_SECRET?.trim();
  if (workerSecret && workerSecret.length < 32) {
    invalidEnvironment.push("STUDIO_CLIPS_WORKER_SECRET");
  }

  const origin = environment.STUDIO_CLIPS_WORKER_API_ORIGIN?.trim();
  if (origin) {
    try {
      const url = new URL(origin);
      const isLoopback =
        url.hostname === "127.0.0.1" ||
        url.hostname === "localhost" ||
        url.hostname === "::1";

      if (
        (url.protocol !== "https:" && !(url.protocol === "http:" && isLoopback)) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
      ) {
        invalidEnvironment.push("STUDIO_CLIPS_WORKER_API_ORIGIN");
      }
    } catch {
      invalidEnvironment.push("STUDIO_CLIPS_WORKER_API_ORIGIN");
    }
  }

  const accountId = environment.R2_ACCOUNT_ID?.trim();
  if (accountId && !/^[a-f0-9]{32}$/i.test(accountId)) {
    invalidEnvironment.push("R2_ACCOUNT_ID");
  }

  return {
    optionalFeatures: {
      broll: environment.PEXELS_API_KEY?.trim()
        ? { missingEnvironment: [], state: "available" }
        : {
            missingEnvironment: ["PEXELS_API_KEY"],
            state: "unavailable",
          },
    },
    required: {
      invalidEnvironment: [...new Set(invalidEnvironment)].sort(),
      missingEnvironment: [...new Set(missingEnvironment)].sort(),
      state:
        missingEnvironment.length === 0 && invalidEnvironment.length === 0
          ? "available"
          : "unavailable",
    },
  };
}
