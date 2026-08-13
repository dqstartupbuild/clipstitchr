import { describe, expect, it, vi } from "vitest";
import { createStudioClipsCreateRequest } from "./createStudioClipsCreateRequest";

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: () => "fixed-id",
}));

describe("createStudioClipsCreateRequest", () => {
  it("builds the exact versioned task envelope with caption intent", () => {
    expect(
      createStudioClipsCreateRequest(
        "product_1",
        {
          contentType: "video/mp4",
          kind: "r2",
          objectKey: "users/owner/studio/v1/media-source/source.mp4",
          sizeBytes: 123,
        },
        {
          options: {
            addSubtitles: true,
            includeBroll: false,
            outputFormat: "vertical",
          },
          source: { file: null, kind: "upload" },
          style: {
            captionTemplate: "minimal",
            customFont: null,
            fontColor: "#FFFFFF",
            fontFamily: "TikTokSans-Regular",
            fontSizePx: 28,
          },
        },
        "users/owner/studio/v1/font/font_1/custom.ttf",
      ),
    ).toEqual({
      idempotencyKey: "create-fixed-id",
      options: {
        addSubtitles: true,
        captionStyle: {
          customFontObjectKey:
            "users/owner/studio/v1/font/font_1/custom.ttf",
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
      source: {
        contentType: "video/mp4",
        kind: "r2",
        objectKey: "users/owner/studio/v1/media-source/source.mp4",
        sizeBytes: 123,
      },
    });
  });
});
