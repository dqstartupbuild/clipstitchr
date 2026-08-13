import { afterEach, describe, expect, it } from "vitest";
import { assertStudioReelWorkerSecret } from "./assertStudioReelWorkerSecret";

const original = process.env.STUDIO_STITCH_WORKER_SECRET;

afterEach(() => {
  if (original === undefined) delete process.env.STUDIO_STITCH_WORKER_SECRET;
  else process.env.STUDIO_STITCH_WORKER_SECRET = original;
});

describe("assertStudioReelWorkerSecret", () => {
  it("rejects missing, prefix-only, and unequal secrets", () => {
    const secret = "worker-secret-value-that-is-long-enough";
    process.env.STUDIO_STITCH_WORKER_SECRET = secret;
    expect(() => assertStudioReelWorkerSecret("")).toThrow("Unauthorized");
    expect(() => assertStudioReelWorkerSecret(secret.slice(0, -6))).toThrow(
      "Unauthorized",
    );
    expect(() => assertStudioReelWorkerSecret(`${secret}-suffix`)).toThrow(
      "Unauthorized",
    );
    expect(() => assertStudioReelWorkerSecret(secret)).not.toThrow();
  });

  it("fails closed when the configured secret is too short", () => {
    process.env.STUDIO_STITCH_WORKER_SECRET = "short";

    expect(() => assertStudioReelWorkerSecret("short")).toThrow(
      "Unauthorized",
    );
  });
});
