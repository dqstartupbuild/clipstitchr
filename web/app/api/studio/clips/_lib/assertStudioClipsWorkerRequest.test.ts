import { afterEach, describe, expect, it } from "vitest";
import { assertStudioClipsWorkerRequest } from "./assertStudioClipsWorkerRequest";

const previousSecret = process.env.STUDIO_CLIPS_WORKER_SECRET;

afterEach(() => {
  if (previousSecret === undefined) {
    delete process.env.STUDIO_CLIPS_WORKER_SECRET;
  } else {
    process.env.STUDIO_CLIPS_WORKER_SECRET = previousSecret;
  }
});

describe("assertStudioClipsWorkerRequest", () => {
  it("rejects an exactly matching but weak configured secret", () => {
    process.env.STUDIO_CLIPS_WORKER_SECRET = "weak-secret";
    const request = new Request("https://clipstitchr.test/worker", {
      headers: { "x-studio-clips-worker-secret": "weak-secret" },
    });

    expect(() => assertStudioClipsWorkerRequest(request)).toThrow("Unauthorized");
  });

  it("accepts only an exact matching secret of at least 32 bytes", () => {
    const secret = "clips-worker-secret-that-is-long-enough";
    process.env.STUDIO_CLIPS_WORKER_SECRET = secret;
    const request = new Request("https://clipstitchr.test/worker", {
      headers: { "x-studio-clips-worker-secret": secret },
    });

    expect(assertStudioClipsWorkerRequest(request)).toBe(secret);
  });
});
