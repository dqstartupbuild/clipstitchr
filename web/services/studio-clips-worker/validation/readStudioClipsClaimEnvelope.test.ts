import { describe, expect, it } from "vitest";
import { createStudioClipsTestClaim } from "../testing/createStudioClipsTestClaim";
import { readStudioClipsClaimEnvelope } from "./readStudioClipsClaimEnvelope";

describe("readStudioClipsClaimEnvelope", () => {
  it("accepts a strict YouTube claim", () => {
    const claim = readStudioClipsClaimEnvelope(createStudioClipsTestClaim());
    if (claim.mode !== "initial") throw new Error("Expected an initial claim.");

    expect(claim.source).toEqual({
      kind: "youtube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
  });

  it("accepts a Product-scoped Studio R2 source", () => {
    const claim = readStudioClipsClaimEnvelope(
      createStudioClipsTestClaim({
        source: {
          contentType: "video/mp4",
          kind: "r2",
          objectKey:
            "users/user_123/studio/v1/media-source/product_123/source_1/video.mp4",
          sizeBytes: 32,
        },
      }),
    );
    if (claim.mode !== "initial") throw new Error("Expected an initial claim.");

    expect(claim.source.kind).toBe("r2");
  });

  it("accepts only a Product-scoped Studio font in caption settings", () => {
    expect(
      readStudioClipsClaimEnvelope(
        createStudioClipsTestClaim({
          options: {
            captionStyle: {
              customFontObjectKey:
                "users/user_123/studio/v1/font/product_123/font_1/custom.ttf",
              fontColorHex: "#FFEEDD",
              fontFamily: "Custom",
              fontSizePx: 42,
              templateId: "minimal",
            },
          },
        }),
      ),
    ).toMatchObject({ mode: "initial" });
    const claim = readStudioClipsClaimEnvelope(
      createStudioClipsTestClaim({
        options: {
          captionStyle: {
            customFontObjectKey:
              "users/user_123/studio/v1/font/product_123/font_1/custom.ttf",
            fontColorHex: "#FFEEDD",
            fontFamily: "Custom",
            fontSizePx: 42,
            templateId: "minimal",
          },
        },
      }),
    );
    if (claim.mode !== "initial") throw new Error("Expected an initial claim.");
    expect(claim.options.captionStyle).toMatchObject({ templateId: "minimal" });

    expect(() =>
      readStudioClipsClaimEnvelope(
        createStudioClipsTestClaim({
          options: {
            captionStyle: {
              customFontObjectKey:
                "users/user_456/studio/v1/font/product_123/font_1/custom.ttf",
              templateId: "minimal",
            },
          },
        }),
      ),
    ).toThrow("does not belong");
    expect(() =>
      readStudioClipsClaimEnvelope(
        createStudioClipsTestClaim({
          options: {
            captionStyle: {
              customFontObjectKey:
                "users/user_123/studio/v1/font/product_456/font_1/custom.ttf",
              templateId: "minimal",
            },
          },
        }),
      ),
    ).toThrow("does not belong");
  });

  it("rejects extra fields, secrets, and signed URL fields", () => {
    expect(() =>
      readStudioClipsClaimEnvelope({
        ...createStudioClipsTestClaim(),
        apiKey: "do-not-accept-me",
      }),
    ).toThrow("claim envelope is invalid");
    expect(() =>
      readStudioClipsClaimEnvelope(
        createStudioClipsTestClaim({
          source: {
            kind: "youtube",
            url: "https://youtube.com/watch?v=dQw4w9WgXcQ&X-Amz-Signature=secret",
          },
        }),
      ),
    ).toThrow("supported HTTPS YouTube");
  });

  it("rejects a cross-owner R2 object", () => {
    expect(() =>
      readStudioClipsClaimEnvelope(
        createStudioClipsTestClaim({
          source: {
            contentType: "video/mp4",
            kind: "r2",
            objectKey:
              "users/user_456/studio/v1/media-source/product_123/source_1/video.mp4",
            sizeBytes: 32,
          },
        }),
      ),
    ).toThrow("does not belong");
  });

  it("rejects a cross-Product R2 source", () => {
    expect(() =>
      readStudioClipsClaimEnvelope(
        createStudioClipsTestClaim({
          source: {
            contentType: "video/mp4",
            kind: "r2",
            objectKey:
              "users/user_123/studio/v1/media-source/product_456/source_1/video.mp4",
            sizeBytes: 32,
          },
        }),
      ),
    ).toThrow("does not belong");
  });

  it("rejects malformed dates and oversized payloads", () => {
    expect(() =>
      readStudioClipsClaimEnvelope(
        createStudioClipsTestClaim({ requestedAt: "2026-99-99T00:00:00Z" }),
      ),
    ).toThrow("claim envelope is invalid");
    expect(() =>
      readStudioClipsClaimEnvelope({
        ...createStudioClipsTestClaim(),
        padding: "x".repeat(20_000),
      }),
    ).toThrow("claim envelope is invalid");
  });
});
