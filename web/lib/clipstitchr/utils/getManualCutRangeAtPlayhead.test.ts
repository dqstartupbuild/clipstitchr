import { describe, expect, it } from "vitest";
import { getManualCutRangeAtPlayhead } from "@/lib/clipstitchr/utils/getManualCutRangeAtPlayhead";

describe("getManualCutRangeAtPlayhead", () => {
  it("creates a one-second cut from the current playhead", () => {
    expect(
      getManualCutRangeAtPlayhead({
        duration: 12,
        playheadSeconds: 4,
        trimRange: { end: 10, start: 2 },
      }),
    ).toEqual({
      end: 5,
      start: 4,
    });
  });

  it("keeps the suggested cut inside the active trim range", () => {
    expect(
      getManualCutRangeAtPlayhead({
        duration: 12,
        playheadSeconds: 9.75,
        trimRange: { end: 10, start: 2 },
      }),
    ).toEqual({
      end: 10,
      start: 9,
    });
  });

  it("returns null when the clip is too short to cut", () => {
    expect(
      getManualCutRangeAtPlayhead({
        duration: 0.05,
        playheadSeconds: 0,
        trimRange: { end: 0.05, start: 0 },
      }),
    ).toBeNull();
  });
});
