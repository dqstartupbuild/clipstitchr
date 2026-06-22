import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProductSettingsDetailsDialog } from "@/app/_components/settings/ProductSettingsDetailsDialog";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

function createProduct(overrides: Partial<ProductProfile> = {}): ProductProfile {
  return {
    audienceDetails: "Solo founders launching their first offer.",
    cliprPlaceholderFillers: {
      audience: ["solo founders", "first-time launchers"],
      pain_point: ["messy launch plan"],
    },
    createdAt: "2026-05-20T12:00:00.000Z",
    eligibleCliprHookStyleKeys: ["mystery_gap", "direct_diagnosis"],
    emotionalNarrative: "They want launch day to feel calm and real.",
    id: "product_1",
    hookEdgeLevel: "bold",
    hookGenerationGoal: "comments",
    inferredPainPoints: [
      "Launch work feels scattered",
      "They do not know what to post",
    ],
    inferredProblem: "Founders struggle to turn launch plans into posts.",
    name: "Launch Kit",
    preferredCliprHookStyleKey: "mystery_gap",
    productDetails: "A planning tool for product launches.",
    rejectedHookExamples: ["This changes everything"],
    updatedAt: "2026-05-21T12:00:00.000Z",
    websiteUrl: "https://launchkit.example.com/",
    winningHookExamples: ["I thought launch day would feel calmer"],
    ...overrides,
  };
}

describe("ProductSettingsDetailsDialog", () => {
  it("renders saved product data and generated writing notes", () => {
    const markup = renderToStaticMarkup(
      <ProductSettingsDetailsDialog product={createProduct()} onClose={vi.fn()} />,
    );

    expect(markup).toContain("Product details");
    expect(markup).toContain("Audience details");
    expect(markup).toContain("Emotional narrative");
    expect(markup).toContain("Audience problem");
    expect(markup).toContain("Launch Kit");
    expect(markup).toContain("A planning tool for product launches.");
    expect(markup).toContain("Solo founders launching their first offer.");
    expect(markup).toContain("They want launch day to feel calm and real.");
    expect(markup).toContain("https://launchkit.example.com/");
    expect(markup).toContain("Founders struggle to turn launch plans into posts.");
    expect(markup).toContain("Launch work feels scattered");
    expect(markup).toContain("Hook goal");
    expect(markup).toContain("Get more comments");
    expect(markup).toContain("Hook tone");
    expect(markup).toContain("Bold");
    expect(markup).toContain("Hooks to learn from");
    expect(markup).toContain("I thought launch day would feel calmer");
    expect(markup).toContain("Hooks to avoid");
    expect(markup).toContain("This changes everything");
    expect(markup).toContain("Writing angles");
    expect(markup).toContain("Phrase bank");
    expect(markup).toContain("solo founders");
    expect(markup).toContain("Saved May 20, 2026");
    expect(markup).toContain("Updated May 21, 2026");
  });
});
