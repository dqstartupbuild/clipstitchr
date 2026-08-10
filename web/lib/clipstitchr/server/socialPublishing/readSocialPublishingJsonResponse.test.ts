import { describe, expect, it } from "vitest";
import { readSocialPublishingJsonResponse } from "@/lib/clipstitchr/server/socialPublishing/readSocialPublishingJsonResponse";

describe("readSocialPublishingJsonResponse", () => {
  it("reads valid JSON responses", async () => {
    await expect(
      readSocialPublishingJsonResponse<{ ok: boolean }>(
        Response.json({ ok: true }),
      ),
    ).resolves.toEqual({ ok: true });
  });

  it("replaces HTML parsing errors with a useful provider message", async () => {
    await expect(
      readSocialPublishingJsonResponse(
        new Response("<!DOCTYPE html><html></html>", {
          headers: { "content-type": "text/html" },
        }),
      ),
    ).rejects.toThrow(
      "Zernio returned an unexpected response. Please try again in a moment.",
    );
  });
});
