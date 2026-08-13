import { describe, expect, it } from "vitest";
import { getStudioReelWorkerRuntimeCheck } from "./getStudioReelWorkerRuntimeCheck";

const base: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  R2_ACCESS_KEY_ID: "access",
  R2_ACCOUNT_ID: "account",
  R2_BUCKET_NAME: "bucket",
  R2_SECRET_ACCESS_KEY: "secret",
  STUDIO_BETA_ENABLED: "true",
  STUDIO_STITCH_EXECUTION_ENABLED: "true",
  STUDIO_STITCH_WORKER_API_ORIGIN: "https://clipstitchr.example",
  STUDIO_STITCH_WORKER_SECRET: "s".repeat(32),
};

describe("getStudioReelWorkerRuntimeCheck", () => {
  it("requires a distinct strong worker secret and keeps providers optional", () => {
    expect(getStudioReelWorkerRuntimeCheck(base)).toMatchObject({
      missingEnvironment: [],
      providers: { dansugc: false, gemini: false, elevenlabs: false },
      ready: true,
    });
    expect(
      getStudioReelWorkerRuntimeCheck({
        ...base,
        STUDIO_STITCH_WORKER_SECRET: "short",
      }),
    ).toMatchObject({
      missingEnvironment: ["STUDIO_STITCH_WORKER_SECRET"],
      ready: false,
    });
  });

  it("reports DanSUGC ready only with an exact download-host allowlist", () => {
    expect(
      getStudioReelWorkerRuntimeCheck({
        ...base,
        DANSUGC_API_KEY: "dsk_test_key",
        STUDIO_STITCH_DANSUGC_DOWNLOAD_HOSTS: "media.example.test",
      }).providers.dansugc,
    ).toBe(true);
  });

  it("fails closed when the independent Studio kill switch is not exact true", () => {
    expect(
      getStudioReelWorkerRuntimeCheck({
        ...base,
        STUDIO_BETA_ENABLED: "false",
      }),
    ).toMatchObject({
      enabled: false,
      missingEnvironment: ["STUDIO_BETA_ENABLED"],
      ready: false,
    });
  });
});
