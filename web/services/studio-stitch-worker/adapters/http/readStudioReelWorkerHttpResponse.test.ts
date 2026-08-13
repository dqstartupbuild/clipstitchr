import { describe, expect, it } from "vitest";
import { readStudioReelWorkerHttpResponse } from "./readStudioReelWorkerHttpResponse";

describe("readStudioReelWorkerHttpResponse", () => {
  it("never copies coordinator errors into durable worker failures", async () => {
    const privateValues = [
      "https://r2.example/private.mp4?signature=secret",
      "users/user_1/studio/private.mp4",
      "Bearer private-token",
      "authorization=private",
    ];
    for (const privateValue of privateValues) {
      await expect(
        readStudioReelWorkerHttpResponse(
          Response.json({ error: privateValue }, { status: 409 }),
        ),
      ).rejects.toMatchObject({
        code: "COORDINATOR_CONFLICT",
        publicMessage:
          "Studio Stitch coordinator state changed. Claim the run again.",
      });
    }
  });

  it("preserves coordinator status classification with fixed messages", async () => {
    await expect(
      readStudioReelWorkerHttpResponse(
        Response.json({ error: "private" }, { status: 429 }),
      ),
    ).rejects.toMatchObject({
      code: "COORDINATOR_RATE_LIMITED",
      kind: "retryable",
      publicMessage: "The Studio Stitch coordinator rate limit was reached.",
    });
  });

  it("rejects malformed UTF-8 in successful coordinator JSON", async () => {
    const malformed = new Uint8Array([
      0x7b,
      0x22,
      0x76,
      0x61,
      0x6c,
      0x75,
      0x65,
      0x22,
      0x3a,
      0x22,
      0xc3,
      0x28,
      0x22,
      0x7d,
    ]);

    await expect(
      readStudioReelWorkerHttpResponse(
        new Response(malformed, { status: 200 }),
      ),
    ).rejects.toMatchObject({ code: "INVALID_COORDINATOR_RESPONSE" });
  });
});
