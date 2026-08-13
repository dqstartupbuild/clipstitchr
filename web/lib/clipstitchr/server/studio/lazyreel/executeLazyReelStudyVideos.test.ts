import { describe, expect, it } from "vitest";
import { executeLazyReelStudyVideos } from "./executeLazyReelStudyVideos";

describe("executeLazyReelStudyVideos", () => {
  it("filters real links and sorts deterministically", () => {
    const result = executeLazyReelStudyVideos({
      hookPattern: "belief challenging",
      limit: 4,
      niche: "skincare",
      tool: "study_videos",
    });

    expect(result.data.examples).toHaveLength(4);
    expect(result.data.examples.every((item) => item.niche === "skincare")).toBe(true);
    expect(result.data.examples.map((item) => item.viewsPerFollower)).toEqual(
      [...result.data.examples.map((item) => item.viewsPerFollower)].sort(
        (left, right) => right - left,
      ),
    );
    expect(result.links).toHaveLength(4);
  });

  it("does not treat an empty query as an all-record fuzzy match", () => {
    const result = executeLazyReelStudyVideos({ query: "", tool: "study_videos", limit: 3 });

    expect(result.data.examples).toHaveLength(3);
    expect(result.data.corpusMatches).toHaveLength(3);
    expect(result.methodology).toContain("non-empty exact-or-contained");
  });

  it("returns no examples for a real but unmatched query", () => {
    const result = executeLazyReelStudyVideos({
      query: "quantum potato",
      tool: "study_videos",
    });

    expect(result.data.examples).toEqual([]);
    expect(result.title).toBe("No matching videos");
  });
});
