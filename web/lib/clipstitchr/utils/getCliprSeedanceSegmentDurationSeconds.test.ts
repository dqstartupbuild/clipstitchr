import { describe, expect, it } from "vitest";
import { getCliprSeedanceSegmentDurationSeconds } from "@/lib/clipstitchr/utils/getCliprSeedanceSegmentDurationSeconds";

describe("getCliprSeedanceSegmentDurationSeconds", () => {
  it("caps segments at Seedance's 15-second limit", () => {
    expect(getCliprSeedanceSegmentDurationSeconds(60)).toBe(15);
  });

  it("keeps short follow-up segments useful", () => {
    expect(getCliprSeedanceSegmentDurationSeconds(4)).toBe(8);
  });

  it("rounds fractional remaining duration up", () => {
    expect(getCliprSeedanceSegmentDurationSeconds(11.2)).toBe(12);
  });
});
