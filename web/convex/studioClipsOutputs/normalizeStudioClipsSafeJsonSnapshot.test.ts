import { describe, expect, it } from "vitest";
import { normalizeStudioClipsSafeJsonSnapshot } from "./normalizeStudioClipsSafeJsonSnapshot";

describe("normalizeStudioClipsSafeJsonSnapshot", () => {
  it("returns deterministic key ordering and exact UTF-8 size", () => {
    const result = normalizeStudioClipsSafeJsonSnapshot(
      '{"z":1,"a":{"two":2,"one":"✓"}}',
      1024,
    );
    expect(result.json).toBe('{"a":{"one":"✓","two":2},"z":1}');
    expect(result.byteLength).toBe(new TextEncoder().encode(result.json).byteLength);
  });

  it.each([
    '{"url":"https://example.test/file"}',
    '{"access_token":"abc"}',
    '{"value":"x?X-Amz-Signature=abc"}',
    '{"value":"Bearer abcdefghijklmnop"}',
    '{"value":"api_key=abc"}',
  ])("rejects URLs and credential-shaped data: %s", (snapshotJson) => {
    expect(() => normalizeStudioClipsSafeJsonSnapshot(snapshotJson, 1024)).toThrow(
      /unsafe/,
    );
  });

  it("keeps ordinary creative copy that uses security-adjacent words", () => {
    expect(
      normalizeStudioClipsSafeJsonSnapshot(
        '{"transcript":"The secret is a stronger opening hook."}',
        1024,
      ).json,
    ).toBe('{"transcript":"The secret is a stronger opening hook."}');
  });

  it("enforces the encoded byte boundary", () => {
    expect(() =>
      normalizeStudioClipsSafeJsonSnapshot('{"text":"abcdef"}', 5),
    ).toThrow("too large");
  });
});
