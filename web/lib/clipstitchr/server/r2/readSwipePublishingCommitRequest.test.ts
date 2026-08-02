import { describe, expect, it } from "vitest";
import { readSwipePublishingCommitRequest } from "@/lib/clipstitchr/server/r2/readSwipePublishingCommitRequest";

function createRequest(body: string) {
  return new Request("https://clipstitchr.test/commit", {
    body,
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

describe("readSwipePublishingCommitRequest", () => {
  it("accepts only a bounded upload attempt identifier", async () => {
    await expect(
      readSwipePublishingCommitRequest(
        createRequest(JSON.stringify({ attemptId: " attempt_1 " })),
      ),
    ).resolves.toEqual({ attemptId: "attempt_1" });
  });

  it("rejects missing, oversized, and malformed requests", async () => {
    for (const request of [
      createRequest("{}"),
      createRequest("{"),
      createRequest(JSON.stringify({ attemptId: "x".repeat(121) })),
      createRequest(JSON.stringify({ attemptId: "x".repeat(1_100) })),
    ]) {
      await expect(readSwipePublishingCommitRequest(request)).rejects.toThrow();
    }
  });
});
