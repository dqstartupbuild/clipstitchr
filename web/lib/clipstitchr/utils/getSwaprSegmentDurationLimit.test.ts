import { describe, expect, it } from "vitest";
import { getSwaprSegmentDurationLimit } from "@/lib/clipstitchr/utils/getSwaprSegmentDurationLimit";

describe("getSwaprSegmentDurationLimit", () => {
  it("keeps photo-matched provider segments to ten seconds", () => {
    expect(getSwaprSegmentDurationLimit("image")).toBe(10);
  });

  it("keeps video-matched provider segments to thirty seconds", () => {
    expect(getSwaprSegmentDurationLimit("video")).toBe(30);
  });
});
