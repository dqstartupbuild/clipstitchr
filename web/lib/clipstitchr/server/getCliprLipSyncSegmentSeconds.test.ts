import { describe, expect, it } from "vitest";
import { getCliprLipSyncSegmentSeconds } from "@/lib/clipstitchr/server/getCliprLipSyncSegmentSeconds";

describe("getCliprLipSyncSegmentSeconds", () => {
  it("returns segment sizes only for constrained lip-sync models", () => {
    expect(getCliprLipSyncSegmentSeconds("pixverse/lipsync")).toBe(30);
    expect(
      getCliprLipSyncSegmentSeconds(
        "bytedance/latentsync:637ce1919f807ca20da3a448ddc2743535d2853649574cd52a933120e9b9e293",
      ),
    ).toBeNull();
  });
});
