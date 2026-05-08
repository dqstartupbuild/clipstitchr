import { describe, expect, it } from "vitest";
import type { CreatedVideo } from "@/lib/clipstitchr/types/CreatedVideo";
import { filterCreatedVideosByName } from "@/lib/clipstitchr/utils/filterCreatedVideosByName";

const createdVideos = [
  { id: "created-1", name: "Morning Unboxing Demo" },
  { id: "created-2", name: "Launch Walkthrough" },
  { id: "created-3", name: "Night Reaction Export" },
] as CreatedVideo[];

describe("filterCreatedVideosByName", () => {
  it("matches created video names case-insensitively", () => {
    expect(filterCreatedVideosByName(createdVideos, "launch")).toEqual([
      createdVideos[1],
    ]);
  });

  it("trims whitespace before matching", () => {
    expect(filterCreatedVideosByName(createdVideos, " EXPORT ")).toEqual([
      createdVideos[2],
    ]);
  });

  it("returns all created videos when the query is blank", () => {
    expect(filterCreatedVideosByName(createdVideos, "   ")).toEqual(
      createdVideos,
    );
  });
});
