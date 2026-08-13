import { afterEach, describe, expect, it, vi } from "vitest";
import { getStudioStitchProviderReadiness } from "./getStudioStitchProviderReadiness";

vi.mock("server-only", () => ({}));

const ENV_KEYS = [
  "DANSUGC_API_KEY",
  "STUDIO_STITCH_DANSUGC_DOWNLOAD_HOSTS",
  "GEMINI_API_KEY",
  "ELEVENLABS_API_KEY",
  "STUDIO_BETA_ENABLED",
  "STUDIO_STITCH_EXECUTION_ENABLED",
  "STUDIO_STITCH_WORKER_SECRET",
  "STUDIO_STITCH_WORKER_API_ORIGIN",
] as const;
const originalEnvironment = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
);

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = originalEnvironment[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("getStudioStitchProviderReadiness", () => {
  it("returns explicit unavailable states without exposing secret values", () => {
    for (const key of ENV_KEYS) delete process.env[key];

    const readiness = getStudioStitchProviderReadiness();

    expect(readiness.map((provider) => provider.state)).toEqual([
      "unavailable",
      "unavailable",
      "unavailable",
      "unavailable",
    ]);
    expect(JSON.stringify(readiness)).not.toContain("undefined");
  });

  it("requires both render settings and preserves canonical provider order", () => {
    process.env.DANSUGC_API_KEY = "secret-dansugc";
    process.env.STUDIO_STITCH_DANSUGC_DOWNLOAD_HOSTS = "media.example.test";
    process.env.GEMINI_API_KEY = "secret-gemini";
    process.env.ELEVENLABS_API_KEY = "secret-elevenlabs";
    process.env.STUDIO_BETA_ENABLED = "true";
    process.env.STUDIO_STITCH_EXECUTION_ENABLED = "true";
    process.env.STUDIO_STITCH_WORKER_SECRET = "s".repeat(32);
    delete process.env.STUDIO_STITCH_WORKER_API_ORIGIN;

    expect(getStudioStitchProviderReadiness()).toEqual([
      expect.objectContaining({ provider: "dansugc", state: "configured" }),
      expect.objectContaining({ provider: "gemini", state: "configured" }),
      expect.objectContaining({
        provider: "elevenlabs",
        state: "configured",
      }),
      expect.objectContaining({ provider: "render", state: "unavailable" }),
    ]);
    expect(JSON.stringify(getStudioStitchProviderReadiness())).not.toContain(
      "secret-",
    );
  });

  it("does not mark DanSUGC configured without an exact download host", () => {
    process.env.DANSUGC_API_KEY = "secret-dansugc";
    delete process.env.STUDIO_STITCH_DANSUGC_DOWNLOAD_HOSTS;

    expect(getStudioStitchProviderReadiness()[0]).toMatchObject({
      provider: "dansugc",
      state: "unavailable",
    });
  });
});
