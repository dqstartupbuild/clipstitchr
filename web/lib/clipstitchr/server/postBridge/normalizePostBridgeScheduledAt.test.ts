import { describe, expect, it, vi } from "vitest";
import { normalizePostBridgeScheduledAt } from "@/lib/clipstitchr/server/postBridge/normalizePostBridgeScheduledAt";

describe("normalizePostBridgeScheduledAt", () => {
  it("allows empty values for immediate posting", () => {
    expect(normalizePostBridgeScheduledAt("")).toBeNull();
  });

  it("normalizes future schedule times", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-27T12:00:00.000Z"));

    expect(normalizePostBridgeScheduledAt("2026-06-27T13:00:00.000Z")).toBe(
      "2026-06-27T13:00:00.000Z",
    );

    vi.useRealTimers();
  });

  it("rejects invalid and past schedule times", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-27T12:00:00.000Z"));

    expect(() => normalizePostBridgeScheduledAt("not-a-date")).toThrow(
      "Choose a time to schedule this post.",
    );
    expect(() =>
      normalizePostBridgeScheduledAt("2026-06-27T11:00:00.000Z"),
    ).toThrow("Choose a future time to schedule this post.");

    vi.useRealTimers();
  });
});
