import { describe, expect, it } from "vitest";
import type { LazyReelWorkflowKey } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowKey";
import { executeLazyReelWorkflow } from "./executeLazyReelWorkflow";

describe("executeLazyReelWorkflow", () => {
  it.each<LazyReelWorkflowKey>([
    "format_deconstructor",
    "format_prompt_builder",
    "higgsfield_director",
    "ugc_ad_director",
    "ugc_ad_generator",
    "video_editor",
  ])("builds a JSON-safe, plan-only %s workflow", (workflow) => {
    const result = executeLazyReelWorkflow({
      brief: "Open on the spilled electrolyte powder, then show the clean one-scoop routine.",
      product: "Trail Mix",
      targetDurationSeconds: 24,
      workflow,
    });

    expect(result.workflow).toBe(workflow);
    expect(result.data.executionStatus).toBe("plan_only");
    expect(result.data.targetDurationSeconds).toBe(24);
    expect(result.data.manifest.length).toBeGreaterThan(0);
    expect(result.limitations.join(" ")).toContain("no provider request");
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it("calibrates a clip manifest to duration without exceeding the bounded range", () => {
    const short = executeLazyReelWorkflow({
      brief: "A product demo with a withheld payoff.",
      targetDurationSeconds: 2,
      workflow: "format_prompt_builder",
    });
    const long = executeLazyReelWorkflow({
      brief: "A long educational product demo with a withheld payoff.",
      targetDurationSeconds: 900,
      workflow: "format_prompt_builder",
    });

    expect(short.data.targetDurationSeconds).toBe(5);
    expect(short.data.manifest).toHaveLength(3);
    expect(long.data.targetDurationSeconds).toBe(180);
    expect(long.data.manifest).toHaveLength(45);
  });

  it("lists paid-provider and rate-limit gates for generator workflows", () => {
    const result = executeLazyReelWorkflow({
      brief: "Generate a three-shot unboxing plan.",
      workflow: "ugc_ad_generator",
    });

    expect(result.data.providerRequirements.join(" ")).toContain("fal.ai");
    expect(result.data.providerRequirements.join(" ")).toContain("rate-limit");
    expect(result.limitations.join(" ")).toContain("FFmpeg process");
  });

  it("rejects an empty brief", () => {
    expect(() =>
      executeLazyReelWorkflow({ brief: "", workflow: "video_editor" }),
    ).toThrow("Brief is required");
  });
});
