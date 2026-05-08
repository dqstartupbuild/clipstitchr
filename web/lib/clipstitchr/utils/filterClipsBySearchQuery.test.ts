import { describe, expect, it } from "vitest";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { filterClipsBySearchQuery } from "@/lib/clipstitchr/utils/filterClipsBySearchQuery";

const clips = [
  {
    id: "ugc-1",
    name: "Morning Unboxing",
    clipType: "ugc",
    tags: ["creator", "kitchen"],
  },
  {
    id: "demo-1",
    name: "Product Demo Walkthrough",
    clipType: "demo",
    tags: ["features"],
  },
  {
    id: "ugc-2",
    name: "Night Reaction",
    clipType: "ugc",
    tags: ["testimonial"],
  },
] as VideoClip[];

describe("filterClipsBySearchQuery", () => {
  it("matches video names case-insensitively", () => {
    expect(filterClipsBySearchQuery(clips, "DEMO")).toEqual([clips[1]]);
  });

  it("matches video tags", () => {
    expect(filterClipsBySearchQuery(clips, "testimonial")).toEqual([clips[2]]);
  });

  it("matches clip type tags", () => {
    expect(filterClipsBySearchQuery(clips, "ugc")).toEqual([
      clips[0],
      clips[2],
    ]);
  });

  it("trims whitespace before matching", () => {
    expect(filterClipsBySearchQuery(clips, " reaction ")).toEqual([clips[2]]);
  });

  it("returns all clips when the query is blank", () => {
    expect(filterClipsBySearchQuery(clips, "   ")).toEqual(clips);
  });
});
