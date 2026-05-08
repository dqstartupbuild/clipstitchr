import { describe, expect, it } from "vitest";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { filterClipsByName } from "@/lib/clipstitchr/utils/filterClipsByName";

const clips = [
  { id: "ugc-1", name: "Morning Unboxing" },
  { id: "demo-1", name: "Product Demo Walkthrough" },
  { id: "ugc-2", name: "Night Reaction" },
] as VideoClip[];

describe("filterClipsByName", () => {
  it("matches video names case-insensitively", () => {
    expect(filterClipsByName(clips, "DEMO")).toEqual([clips[1]]);
  });

  it("trims whitespace before matching", () => {
    expect(filterClipsByName(clips, " reaction ")).toEqual([clips[2]]);
  });

  it("returns all clips when the query is blank", () => {
    expect(filterClipsByName(clips, "   ")).toEqual(clips);
  });
});
