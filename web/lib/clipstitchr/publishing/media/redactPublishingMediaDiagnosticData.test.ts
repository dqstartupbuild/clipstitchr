import { describe, expect, it } from "vitest";
import { redactPublishingMediaDiagnosticData } from "@/lib/clipstitchr/publishing/media/redactPublishingMediaDiagnosticData";

describe("redactPublishingMediaDiagnosticData", () => {
  it("redacts nested signed URLs while preserving ordinary public URLs", () => {
    const redacted = redactPublishingMediaDiagnosticData({
      downloadUrl:
        "https://media.clipstitchr.com/video.mp4?X-Amz-Signature=super-secret",
      error:
        "Fetch failed for https://r2.example.com/video.mp4?token=private-token",
      nested: [
        {
          callbackUrl: "https://clipstitchr.com/dashboard/publishing/posts",
          signedUrl:
            "https://media.clipstitchr.com/image.jpg?sig=another-secret",
        },
      ],
    });

    expect(redacted).toEqual({
      downloadUrl: "[REDACTED_SIGNED_URL]",
      error: "Fetch failed for [REDACTED_SIGNED_URL]",
      nested: [
        {
          callbackUrl: "https://clipstitchr.com/dashboard/publishing/posts",
          signedUrl: "[REDACTED_SIGNED_URL]",
        },
      ],
    });
    expect(JSON.stringify(redacted)).not.toContain("super-secret");
    expect(JSON.stringify(redacted)).not.toContain("private-token");
    expect(JSON.stringify(redacted)).not.toContain("another-secret");
  });

  it("handles circular diagnostics without leaking their contents", () => {
    const diagnostic: Record<string, unknown> = {
      signedUrl: "https://media.clipstitchr.com/video.mp4?token=secret",
    };
    diagnostic.self = diagnostic;

    expect(redactPublishingMediaDiagnosticData(diagnostic)).toEqual({
      self: "[CIRCULAR]",
      signedUrl: "[REDACTED_SIGNED_URL]",
    });
  });
});
