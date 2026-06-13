import { describe, expect, it } from "vitest";
import { createCliprDemoVideoInput } from "@/lib/clipstitchr/server/createCliprDemoVideoInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

function createProduct(): ProductProfile {
  return {
    audienceDetails: "Solo founders",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: ["editing takes too long"],
    inferredProblem: "posting product demos is slow",
    name: "Launch Kit",
    productDetails: "A tool that turns product demos into short videos.",
    updatedAt: "2026-05-20T00:00:00.000Z",
  };
}

describe("createCliprDemoVideoInput", () => {
  it("uses Seedance reference videos without audio generation", () => {
    const input = createCliprDemoVideoInput({
      demoClipName: "Onboarding demo",
      demoVideoDescription: "A quick walkthrough of the dashboard.",
      durationSeconds: 8,
      product: createProduct(),
      referenceVideoUrl: "https://example.com/demo.mp4",
    });

    expect(input).toEqual(
      expect.objectContaining({
        reference_videos: ["https://example.com/demo.mp4"],
        duration: 8,
        resolution: "720p",
        aspect_ratio: "9:16",
        generate_audio: false,
      }),
    );
    expect(input.prompt).toContain("[Video1]");
    expect(input.prompt).toContain("modern phone screen");
    expect(input.prompt).toContain("Onboarding demo");
  });
});
