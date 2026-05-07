import { describe, expect, it } from "vitest";
import { clampVideoTrimRange } from "@/lib/clipr/utils/clampVideoTrimRange";

describe("clampVideoTrimRange", () => {
  it("keeps trim times inside the clip duration", () => {
    const trimRange = clampVideoTrimRange(
      {
        start: -5,
        end: 99,
      },
      12,
    );

    expect(trimRange).toEqual({
      start: 0,
      end: 12,
    });
  });

  it("keeps the end after the start", () => {
    const trimRange = clampVideoTrimRange(
      {
        start: 8,
        end: 2,
      },
      10,
    );

    expect(trimRange.start).toBe(8);
    expect(trimRange.end).toBeCloseTo(8.1);
  });

  it("allows very short clips to keep their whole duration", () => {
    const trimRange = clampVideoTrimRange(
      {
        start: 1,
        end: 2,
      },
      0.05,
    );

    expect(trimRange).toEqual({
      start: 0,
      end: 0.05,
    });
  });
});
