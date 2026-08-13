import { describe, expect, it } from "vitest";
import { getStudioClipsWorkerRuntimePreflight } from "./getStudioClipsWorkerRuntimePreflight";
import { readStudioClipsWorkerRuntimeConfig } from "./readStudioClipsWorkerRuntimeConfig";

function createEnvironment(): NodeJS.ProcessEnv {
  return {
    ASSEMBLYAI_API_KEY: "assembly-secret",
    GOOGLE_API_KEY: "google-secret",
    NODE_ENV: "test",
    R2_ACCESS_KEY_ID: "r2-key",
    R2_ACCOUNT_ID: "a".repeat(32),
    R2_BUCKET_NAME: "clips",
    R2_SECRET_ACCESS_KEY: "r2-secret",
    STUDIO_CLIPS_ANALYSIS_MODEL: "configured-model",
    STUDIO_CLIPS_ANALYSIS_PROVIDER: "google",
    STUDIO_CLIPS_WORKER_API_ORIGIN: "https://clipstitchr.test",
    STUDIO_BETA_ENABLED: "true",
    STUDIO_CLIPS_WORKER_QUEUE_ENABLED: "true",
    STUDIO_CLIPS_WORKER_SECRET: "worker-secret-that-is-at-least-32-chars",
  };
}

describe("getStudioClipsWorkerRuntimePreflight", () => {
  it("reports precise required and optional unavailable states without credentials", () => {
    const result = getStudioClipsWorkerRuntimePreflight({ NODE_ENV: "test" });

    expect(result.required.state).toBe("unavailable");
    expect(result.required.missingEnvironment).toContain("ASSEMBLYAI_API_KEY");
    expect(result.optionalFeatures.broll).toEqual({
      missingEnvironment: ["PEXELS_API_KEY"],
      state: "unavailable",
    });
  });

  it("accepts complete server configuration while keeping B-roll independently optional", () => {
    const environment = createEnvironment();
    expect(getStudioClipsWorkerRuntimePreflight(environment)).toMatchObject({
      required: { invalidEnvironment: [], missingEnvironment: [], state: "available" },
    });
    const config = readStudioClipsWorkerRuntimeConfig(environment);
    expect(config.analysis).toMatchObject({ model: "configured-model", provider: "google" });
    expect(config.broll).toBeUndefined();
  });

  it("rejects arbitrary coordinator origins and analysis providers", () => {
    const environment = createEnvironment();
    environment.STUDIO_CLIPS_WORKER_API_ORIGIN = "http://external.test";
    environment.STUDIO_CLIPS_ANALYSIS_PROVIDER = "arbitrary";
    expect(getStudioClipsWorkerRuntimePreflight(environment).required).toMatchObject({
      invalidEnvironment: [
        "STUDIO_CLIPS_ANALYSIS_PROVIDER",
        "STUDIO_CLIPS_WORKER_API_ORIGIN",
      ],
      state: "unavailable",
    });
  });

  it("fails closed when either execution switch is not exact true or the secret is short", () => {
    const environment = createEnvironment();
    environment.STUDIO_BETA_ENABLED = " true ";
    environment.STUDIO_CLIPS_WORKER_QUEUE_ENABLED = "TRUE";
    environment.STUDIO_CLIPS_WORKER_SECRET = "short";

    expect(getStudioClipsWorkerRuntimePreflight(environment).required).toMatchObject({
      invalidEnvironment: [
        "STUDIO_BETA_ENABLED",
        "STUDIO_CLIPS_WORKER_QUEUE_ENABLED",
        "STUDIO_CLIPS_WORKER_SECRET",
      ],
      state: "unavailable",
    });
    expect(() => readStudioClipsWorkerRuntimeConfig(environment)).toThrow(
      "Studio Clips worker configuration is unavailable",
    );
  });
});
