import { afterEach, describe, expect, it } from "vitest";
import { assertStudioClipsWorkerSecret } from "./assertStudioClipsWorkerSecret";

const original = process.env.STUDIO_CLIPS_WORKER_SECRET;

afterEach(() => {
  if (original === undefined) delete process.env.STUDIO_CLIPS_WORKER_SECRET;
  else process.env.STUDIO_CLIPS_WORKER_SECRET = original;
});

describe("assertStudioClipsWorkerSecret", () => {
  it("rejects missing, prefix-only, suffix, and unequal secrets", () => {
    const secret = "clips-worker-secret-value-that-is-long-enough";
    process.env.STUDIO_CLIPS_WORKER_SECRET = secret;
    expect(() => assertStudioClipsWorkerSecret("")).toThrow("Unauthorized");
    expect(() => assertStudioClipsWorkerSecret(secret.slice(0, -6))).toThrow(
      "Unauthorized",
    );
    expect(() => assertStudioClipsWorkerSecret(`${secret}-suffix`)).toThrow(
      "Unauthorized",
    );
    expect(() => assertStudioClipsWorkerSecret(secret.replace("value", "other"))).toThrow(
      "Unauthorized",
    );
    expect(() => assertStudioClipsWorkerSecret(secret)).not.toThrow();
  });

  it("fails closed when the configured secret is too short", () => {
    process.env.STUDIO_CLIPS_WORKER_SECRET = "short";
    expect(() => assertStudioClipsWorkerSecret("short")).toThrow("Unauthorized");
  });
});
