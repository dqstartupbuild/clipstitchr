import { afterEach, describe, expect, it } from "vitest";
import { assertStudioReelWorkerRequest } from "./assertStudioReelWorkerRequest";

const originalSecret = process.env.STUDIO_STITCH_WORKER_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.STUDIO_STITCH_WORKER_SECRET;
  } else {
    process.env.STUDIO_STITCH_WORKER_SECRET = originalSecret;
  }
});

function createRequest(secret: string) {
  return new Request("https://clipstitchr.example/api/studio/stitch/worker/claim", {
    headers: { "x-studio-stitch-worker-secret": secret },
    method: "POST",
  });
}

describe("assertStudioReelWorkerRequest", () => {
  it("accepts only the complete strong configured secret", () => {
    const secret = "worker-secret-value-that-is-long-enough";
    process.env.STUDIO_STITCH_WORKER_SECRET = secret;

    expect(() => assertStudioReelWorkerRequest(createRequest(secret))).not.toThrow();
    expect(() =>
      assertStudioReelWorkerRequest(createRequest(secret.slice(0, -6))),
    ).toThrow("Unauthorized");
    expect(() =>
      assertStudioReelWorkerRequest(createRequest(`${secret}-suffix`)),
    ).toThrow("Unauthorized");
  });

  it("fails closed when the configured secret is too short", () => {
    process.env.STUDIO_STITCH_WORKER_SECRET = "short";

    expect(() => assertStudioReelWorkerRequest(createRequest("short"))).toThrow(
      "Unauthorized",
    );
  });
});
