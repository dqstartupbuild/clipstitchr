import { describe, expect, it } from "vitest";
import { createResolvedProductEnrichmentFields } from "@/lib/clipstitchr/server/createResolvedProductEnrichmentFields";

describe("createResolvedProductEnrichmentFields", () => {
  it("uses enrichment candidates only when editable product fields are blank", () => {
    expect(
      createResolvedProductEnrichmentFields({
        enrichment: {
          audienceDetails: "Website-inferred buyers.",
          emotionalNarrative: "Website-inferred emotional story.",
          inferredPainPoints: [],
          productDetails: "Website-inferred product summary.",
        },
        input: {
          audienceDetails: "",
          name: "LaunchKit",
          productDetails: "",
        },
      }),
    ).toEqual({
      audienceDetails: "Website-inferred buyers.",
      emotionalNarrative: "Website-inferred emotional story.",
      productDetails: "Website-inferred product summary.",
    });
  });

  it("preserves user-entered product fields over enrichment candidates", () => {
    expect(
      createResolvedProductEnrichmentFields({
        enrichment: {
          audienceDetails: "Website-inferred buyers.",
          emotionalNarrative: "Website-inferred emotional story.",
          inferredPainPoints: [],
          productDetails: "Website-inferred product summary.",
        },
        input: {
          audienceDetails: "User-entered audience.",
          emotionalNarrative: "User-entered story.",
          name: "LaunchKit",
          productDetails: "User-entered product.",
        },
      }),
    ).toEqual({
      audienceDetails: "User-entered audience.",
      emotionalNarrative: "User-entered story.",
      productDetails: "User-entered product.",
    });
  });
});
