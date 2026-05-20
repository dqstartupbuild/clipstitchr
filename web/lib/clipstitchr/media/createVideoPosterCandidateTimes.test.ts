import { describe, expect, it } from "vitest";
import { createVideoPosterCandidateTimes } from "@/lib/clipstitchr/media/createVideoPosterCandidateTimes";

describe("createVideoPosterCandidateTimes", () => {
  it("returns zero for zero, negative, and non-finite durations", () => {
    expect(createVideoPosterCandidateTimes(0)).toEqual([0]);
    expect(createVideoPosterCandidateTimes(-4)).toEqual([0]);
    expect(createVideoPosterCandidateTimes(Number.POSITIVE_INFINITY)).toEqual([
      0,
    ]);
  });

  it("caps short clip candidates before the end padding", () => {
    expect(createVideoPosterCandidateTimes(0.4)).toEqual([
      0.04,
      0.1,
      0.2,
      0.25,
      0.35,
    ]);
  });

  it("combines fixed and relative candidates in ascending order", () => {
    expect(createVideoPosterCandidateTimes(12)).toEqual([
      0.25,
      0.5,
      1,
      1.2,
      1.5,
      2.5,
      3,
      4,
      6,
    ]);
  });
});
