import { describe, expect, it } from "vitest";
import { redactStudioClipsSensitiveValue } from "./redactStudioClipsSensitiveValue";

describe("redactStudioClipsSensitiveValue", () => {
  it("redacts nested secrets and signed URL queries", () => {
    const value = redactStudioClipsSensitiveValue({
      authorization: "Bearer top-secret",
      error:
        "Download failed at https://r2.example.test/file.mp4?X-Amz-Signature=abc&X-Amz-Credential=def.",
      nested: { apiKey: "key-123", message: "token=also-secret" },
    });
    const serialized = JSON.stringify(value);

    expect(serialized).toContain("[REDACTED]");
    expect(serialized).toContain("[REDACTED_SIGNED_QUERY]");
    expect(serialized).not.toContain("top-secret");
    expect(serialized).not.toContain("also-secret");
    expect(serialized).not.toContain("X-Amz-Signature=abc");
  });
});
