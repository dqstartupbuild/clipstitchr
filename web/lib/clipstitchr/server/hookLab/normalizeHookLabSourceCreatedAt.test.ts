import { describe, expect, it } from "vitest";
import { normalizeHookLabSourceCreatedAt } from "@/lib/clipstitchr/server/hookLab/normalizeHookLabSourceCreatedAt";

describe("normalizeHookLabSourceCreatedAt", () => {
  it("normalizes ISO, Unix-second, and Unix-millisecond dates", () => {
    expect(normalizeHookLabSourceCreatedAt("2026-07-12T12:00:00Z")).toBe(
      "2026-07-12T12:00:00.000Z",
    );
    expect(normalizeHookLabSourceCreatedAt("1719792000")).toBe(
      "2024-07-01T00:00:00.000Z",
    );
    expect(normalizeHookLabSourceCreatedAt("1719792000000")).toBe(
      "2024-07-01T00:00:00.000Z",
    );
  });

  it("omits missing or invalid dates", () => {
    expect(normalizeHookLabSourceCreatedAt()).toBeUndefined();
    expect(normalizeHookLabSourceCreatedAt("not-a-date")).toBeUndefined();
  });
});
