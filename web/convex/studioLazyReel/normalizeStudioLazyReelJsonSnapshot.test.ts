import { describe, expect, it } from "vitest";
import { normalizeStudioLazyReelJsonSnapshot } from "./normalizeStudioLazyReelJsonSnapshot";

describe("normalizeStudioLazyReelJsonSnapshot", () => {
  it("canonicalizes JSON and records its UTF-8 byte length", () => {
    const snapshot = normalizeStudioLazyReelJsonSnapshot(
      {
        schemaVersion: " research.v1 ",
        payloadJson: '{ "evidence": "observed", "score": 7 }',
      },
      { label: "Research", maxBytes: 1_000 },
    );

    expect(snapshot).toEqual({
      schemaVersion: "research.v1",
      payloadJson: '{"evidence":"observed","score":7}',
      byteLength: 33,
    });
  });

  it("rejects credential fields and signed URLs", () => {
    expect(() =>
      normalizeStudioLazyReelJsonSnapshot(
        {
          schemaVersion: "v1",
          payloadJson: JSON.stringify({ apiKey: "do-not-store" }),
        },
        { label: "Research", maxBytes: 1_000 },
      ),
    ).toThrow("credential fields");

    expect(() =>
      normalizeStudioLazyReelJsonSnapshot(
        {
          schemaVersion: "v1",
          payloadJson: JSON.stringify({
            source: "https://example.com/a?X-Amz-Signature=secret",
          }),
        },
        { label: "Research", maxBytes: 1_000 },
      ),
    ).toThrow("signed URLs");
  });

  it("enforces byte and structure caps", () => {
    expect(() =>
      normalizeStudioLazyReelJsonSnapshot(
        { schemaVersion: "v1", payloadJson: JSON.stringify({ text: "123" }) },
        { label: "Research", maxBytes: 5 },
      ),
    ).toThrow("byte cap");

    expect(() =>
      normalizeStudioLazyReelJsonSnapshot(
        { schemaVersion: "v1", payloadJson: "not-json" },
        { label: "Research", maxBytes: 100 },
      ),
    ).toThrow("valid JSON");
  });
});
