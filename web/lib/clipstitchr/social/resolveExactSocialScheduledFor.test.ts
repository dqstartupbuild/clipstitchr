import { describe, expect, it } from "vitest";
import { resolveExactSocialScheduledFor } from "./resolveExactSocialScheduledFor";

describe("resolveExactSocialScheduledFor", () => {
  it("preserves a valid exact UTC instant", () => {
    expect(
      resolveExactSocialScheduledFor(
        "2026-08-01T14:30:00.000Z",
        "2026-08-01T12:00:00.000Z",
      ),
    ).toBe("2026-08-01T14:30:00.000Z");
  });

  it("rejects past and over-horizon exact times", () => {
    expect(() =>
      resolveExactSocialScheduledFor(
        "2026-08-01T11:59:59.999Z",
        "2026-08-01T12:00:00.000Z",
      ),
    ).toThrow("future time");
    expect(() =>
      resolveExactSocialScheduledFor(
        "2026-11-01T12:00:00.001Z",
        "2026-08-01T12:00:00.000Z",
      ),
    ).toThrow("next 90 days");
  });
});
