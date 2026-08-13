import { describe, expect, it } from "vitest";
import { readStudioClipsCreateRequest } from "./readStudioClipsCreateRequest";

function request(body: unknown) {
  return new Request("https://clipstitchr.test/api/studio/clips/tasks", {
    body: JSON.stringify(body),
    method: "POST",
  });
}

describe("readStudioClipsCreateRequest", () => {
  it("preserves the strict create union including bounded caption intent", async () => {
    await expect(
      readStudioClipsCreateRequest(
        request({
          idempotencyKey: "request_1",
          options: {
            addSubtitles: true,
            captionStyle: {
              fontColorHex: "#FFFFFF",
              fontFamily: "TikTokSans-Regular",
              fontSizePx: 28,
              templateId: "minimal",
            },
            includeBroll: false,
            outputFormat: "vertical",
          },
          productId: "product_1",
          schemaVersion: "studio-clips-create-v1",
          source: { kind: "youtube", url: "https://youtu.be/dQw4w9WgXcQ" },
        }),
      ),
    ).resolves.toMatchObject({
      options: { captionStyle: { templateId: "minimal" } },
      schemaVersion: "studio-clips-create-v1",
    });
  });

  it("rejects missing and unknown top-level fields", async () => {
    await expect(
      readStudioClipsCreateRequest(
        request({
          idempotencyKey: "request_1",
          options: {},
          productId: "product_1",
          schemaVersion: "studio-clips-create-v1",
          source: {},
          token: "do-not-store",
        }),
      ),
    ).rejects.toThrow("unsupported fields");
    await expect(readStudioClipsCreateRequest(request({}))).rejects.toThrow(
      "invalid",
    );
  });
});
