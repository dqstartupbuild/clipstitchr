import { describe, expect, it } from "vitest";
import { getStitchSequenceDuration } from "@/lib/clipstitchr/utils/getStitchSequenceDuration";

describe("getStitchSequenceDuration", () => {
  it("uses one canonical segment once for standalone Normal text timing", () => {
    expect(
      getStitchSequenceDuration([
        {
          clipId: "ugc_1",
          clipName: "Creator clip",
          clipType: "ugc",
          duration: 5,
          order: 0,
          trimRange: { end: 5, start: 0 },
        },
      ]),
    ).toBe(5);
  });
});
