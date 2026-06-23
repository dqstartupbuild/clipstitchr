import { describe, expect, it } from "vitest";
import type { QuickEditDetectorFrameSample } from "@/lib/clipstitchr/types/QuickEditDetectorFrameSample";
import { createQuickEditVisualCandidates } from "@/lib/clipstitchr/server/createQuickEditVisualCandidates";

function createSample({
  mean,
  pixels,
  standardDeviation = 0,
  time,
}: {
  mean: number;
  pixels: number[];
  standardDeviation?: number;
  time: number;
}): QuickEditDetectorFrameSample {
  return {
    mean,
    pixels: Uint8Array.from(pixels),
    standardDeviation,
    time,
  };
}

describe("createQuickEditVisualCandidates", () => {
  it("detects repeated low-motion frame runs", () => {
    expect(
      createQuickEditVisualCandidates([
        createSample({ mean: 120, pixels: [100, 100, 100, 100], time: 0 }),
        createSample({ mean: 120, pixels: [100, 100, 100, 100], time: 1 }),
        createSample({ mean: 120, pixels: [101, 100, 100, 100], time: 2 }),
        createSample({ mean: 120, pixels: [101, 100, 100, 100], time: 3 }),
      ]),
    ).toEqual([
      expect.objectContaining({
        end: 4,
        signals: ["low-motion", "static-frame", "repeated-frame"],
        start: 0,
      }),
    ]);
  });

  it("detects black-frame runs", () => {
    expect(
      createQuickEditVisualCandidates([
        createSample({ mean: 1, pixels: [0, 0, 0, 0], time: 0 }),
        createSample({ mean: 1, pixels: [0, 0, 0, 0], time: 1 }),
      ]),
    ).toEqual([
      expect.objectContaining({
        end: 2,
        signals: ["black-frame"],
        start: 0,
      }),
    ]);
  });
});
