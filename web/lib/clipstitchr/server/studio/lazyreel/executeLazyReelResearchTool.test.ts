import { describe, expect, it } from "vitest";
import type { LazyReelToolRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolRequest";
import { executeLazyReelResearchTool } from "./executeLazyReelResearchTool";

describe("executeLazyReelResearchTool", () => {
  it.each<LazyReelToolRequest>([
    { niche: "skincare", tool: "niche_report" },
    { limit: 2, niche: "fitness", tool: "study_videos" },
    { product: "Matcha Kit", tool: "teardown" },
    { product: "Matcha Kit", tool: "make_brief" },
    { tool: "breakout_laws" },
    { copy: "Our innovative product", tool: "kill_the_slop" },
    { tool: "get_status" },
  ])("dispatches $tool into a JSON-safe common envelope", (request) => {
    const result = executeLazyReelResearchTool(request);

    expect(result.tool).toBe(request.tool);
    expect(result.title).toEqual(expect.any(String));
    expect(result.summary).toEqual(expect.any(String));
    expect(Array.isArray(result.sections)).toBe(true);
    expect(Array.isArray(result.evidence)).toBe(true);
    expect(Array.isArray(result.links)).toBe(true);
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });
});
