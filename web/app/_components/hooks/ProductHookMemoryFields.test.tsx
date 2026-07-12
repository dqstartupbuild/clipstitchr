import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProductHookMemoryFields } from "@/app/_components/hooks/ProductHookMemoryFields";

describe("ProductHookMemoryFields", () => {
  it("shows writing guardrails without asking for raw winning hooks", () => {
    const markup = renderToStaticMarkup(
      <ProductHookMemoryFields
        hookEdgeLevel="punchy"
        hookGenerationGoal="views"
        rejectedHookExamplesText="Stop scrolling"
        onHookEdgeLevelChange={vi.fn()}
        onHookGenerationGoalChange={vi.fn()}
        onRejectedHookExamplesTextChange={vi.fn()}
      />,
    );

    expect(markup).toContain("Set your writing guardrails");
    expect(markup).toContain("Main goal");
    expect(markup).toContain("Tone");
    expect(markup).toContain("Phrases to avoid");
    expect(markup).toContain("Stop scrolling");
    expect(markup).not.toContain("Hooks to learn from");
  });
});
