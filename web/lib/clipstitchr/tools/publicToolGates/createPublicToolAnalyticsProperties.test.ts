import { describe, expect, it } from "vitest";
import { createPublicToolAnalyticsProperties } from "@/lib/clipstitchr/tools/publicToolGates/createPublicToolAnalyticsProperties";

describe("createPublicToolAnalyticsProperties", () => {
  it("returns only fixed catalog and rollout properties", () => {
    const unsafeInput = {
      email: "private@example.com",
      eventName: "tool_gate_displayed",
      gateMode: "useful-preview",
      result: "private result",
      toolKey: "app-hook-generator",
      variant: "hybrid-v1",
    } as const;
    const properties = createPublicToolAnalyticsProperties(unsafeInput);

    expect(properties).toEqual({
      event_type: "tool_gate_displayed",
      experiment_variant: "hybrid-v1",
      gate_mode: "useful-preview",
      tool_key: "app-hook-generator",
    });
    expect(Object.keys(properties).sort()).toEqual([
      "event_type",
      "experiment_variant",
      "gate_mode",
      "tool_key",
    ]);
    expect(JSON.stringify(properties)).not.toContain("private");
  });
});
