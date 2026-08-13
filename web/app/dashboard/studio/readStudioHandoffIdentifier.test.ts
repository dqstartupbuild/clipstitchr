import { describe, expect, it } from "vitest";
import { readStudioHandoffIdentifier } from "./readStudioHandoffIdentifier";

describe("readStudioHandoffIdentifier", () => {
  it("accepts bounded identifiers used by Studio handoffs", () => {
    expect(readStudioHandoffIdentifier("  brief_123-abc  ")).toBe(
      "brief_123-abc",
    );
  });

  it("rejects empty, oversized, and URL-like values", () => {
    expect(readStudioHandoffIdentifier(null)).toBeUndefined();
    expect(readStudioHandoffIdentifier(" ")).toBeUndefined();
    expect(readStudioHandoffIdentifier("a".repeat(121))).toBeUndefined();
    expect(
      readStudioHandoffIdentifier("https://example.com/project"),
    ).toBeUndefined();
  });
});
