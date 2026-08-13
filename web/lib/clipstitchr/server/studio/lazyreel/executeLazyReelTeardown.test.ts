import { describe, expect, it } from "vitest";
import { executeLazyReelTeardown } from "./executeLazyReelTeardown";

describe("executeLazyReelTeardown", () => {
  it("matches an exact saved link without fetching it", () => {
    const result = executeLazyReelTeardown({
      tool: "teardown",
      video: "https://www.tiktok.com/@clearskinfaithy/video/7639178321342827807",
    });

    expect(result.data.mode).toBe("video");
    if (result.data.mode === "video") {
      expect(result.data.sourceMatch).toMatchObject({
        niche: "skincare",
        viewsPerFollower: 2297.3,
      });
      expect(result.data.confidence).toBe("medium");
    }
    expect(result.limitations.join(" ")).toContain("does not fetch");
  });

  it("does not claim a URL inspection for an unknown external link", () => {
    const result = executeLazyReelTeardown({
      tool: "teardown",
      video: "https://www.tiktok.com/@nobody/video/123",
    });

    expect(result.data.mode).toBe("video");
    if (result.data.mode === "video") {
      expect(result.data.sourceMatch).toBeNull();
      expect(result.data.confidence).toBe("low");
    }
    expect(result.links).toEqual([]);
  });

  it("creates a deterministic product replication plan", () => {
    const request = {
      model: "higgsfield" as const,
      niche: "skincare",
      product: "Calm Barrier Serum",
      tool: "teardown" as const,
    };
    const first = executeLazyReelTeardown(request);
    const second = executeLazyReelTeardown(request);

    expect(first).toEqual(second);
    expect(first.data.mode).toBe("product");
    if (first.data.mode === "product") {
      expect(first.data.model.id).toBe("higgsfield");
      expect(first.data.examples.length).toBeGreaterThan(0);
      expect(first.data.brief.beats.length).toBeGreaterThan(0);
    }
  });
});
