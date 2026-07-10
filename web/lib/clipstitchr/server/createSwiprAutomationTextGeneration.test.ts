import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSwiprAutomationTextGeneration } from "@/lib/clipstitchr/server/createSwiprAutomationTextGeneration";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const mocks = vi.hoisted(() => ({
  createSwiprBatchTextGeneration: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/createSwiprBatchTextGeneration", () => ({
  createSwiprBatchTextGeneration: mocks.createSwiprBatchTextGeneration,
}));

const product: ProductProfile = {
  audienceDetails: "Busy founders",
  createdAt: "2026-01-01T00:00:00.000Z",
  emotionalNarrative: "Move fast without messy launch work.",
  id: "product_1",
  inferredPainPoints: ["launches take too long"],
  inferredProblem: "launch work feels scattered",
  name: "Launch Kit",
  productDetails: "AI launch planner",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("createSwiprAutomationTextGeneration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the Swipr page batch generator for one automation draft", async () => {
    const slideshow = {
      caption: "A useful caption",
      description: "A useful long description",
      hashtags: ["#founders"],
      hook: "Your launch feels harder",
      rationale: "It speaks to the audience problem.",
      slides: ["Your launch feels harder", "Make the next step smaller"],
      socialCaption: "A useful caption\n\nA useful long description\n\n#founders",
    };
    const replicate = {} as Parameters<
      typeof createSwiprAutomationTextGeneration
    >[0]["replicate"];

    mocks.createSwiprBatchTextGeneration.mockResolvedValue({
      providerModel: "anthropic/claude-sonnet-4.6",
      providerPredictionId: "prediction_1",
      slideshows: [slideshow],
    });

    await expect(
      createSwiprAutomationTextGeneration({
        callToActionStyle: "engagement",
        creativeContext: "Focus on launch-day anxiety.",
        product,
        replicate,
        slideCount: 8,
      }),
    ).resolves.toEqual({
      ...slideshow,
      providerModel: "anthropic/claude-sonnet-4.6",
      providerPredictionId: "prediction_1",
    });
    expect(mocks.createSwiprBatchTextGeneration).toHaveBeenCalledWith({
      callToActionStyle: "engagement",
      count: 1,
      creativeContext: "Focus on launch-day anxiety.",
      product,
      replicate,
      slideCount: 8,
    });
  });

  it("fails clearly when the provider returns no slideshow", async () => {
    mocks.createSwiprBatchTextGeneration.mockResolvedValue({
      providerModel: "anthropic/claude-sonnet-4.6",
      providerPredictionId: "prediction_1",
      slideshows: [],
    });

    await expect(
      createSwiprAutomationTextGeneration({
        callToActionStyle: "any",
        creativeContext: "",
        product,
        replicate: {} as Parameters<
          typeof createSwiprAutomationTextGeneration
        >[0]["replicate"],
        slideCount: 8,
      }),
    ).rejects.toThrow("The writing provider did not return a Swipr slideshow.");
  });
});
