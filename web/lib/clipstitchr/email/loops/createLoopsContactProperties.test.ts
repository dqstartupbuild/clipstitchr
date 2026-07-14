import { describe, expect, it } from "vitest";
import { createLoopsContactProperties } from "@/lib/clipstitchr/email/loops/createLoopsContactProperties";

describe("createLoopsContactProperties", () => {
  it("projects only the approved bounded contact fields", () => {
    const properties = createLoopsContactProperties({
      contactName: "Avery Creator",
      email: "avery@example.com",
      firstTool: "app-hook-generator",
      latestTool: "app-ad-testing-budget-planner",
      leadSegment: "economics-and-scaling",
      leadStage: "engaged",
      providerContactKey: "provider_opaque_key",
    });

    expect(properties).toEqual({
      source: "ClipStitchr public tools",
      contactName: "Avery Creator",
      firstTool: "app-hook-generator",
      latestTool: "app-ad-testing-budget-planner",
      leadSegment: "economics-and-scaling",
      leadStage: "engaged",
    });
    expect(properties).not.toHaveProperty("email");
    expect(properties).not.toHaveProperty("providerContactKey");
    expect(properties).not.toHaveProperty("subscribed");
  });
});
