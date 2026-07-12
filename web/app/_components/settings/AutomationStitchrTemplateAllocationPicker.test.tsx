import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AutomationStitchrTemplateAllocationPicker } from "@/app/_components/settings/AutomationStitchrTemplateAllocationPicker";

describe("AutomationStitchrTemplateAllocationPicker", () => {
  it("describes legacy-compatible allocations as saved setup Ideas", () => {
    const markup = renderToStaticMarkup(
      <AutomationStitchrTemplateAllocationPicker
        allocations={[]}
        disabled={false}
        generationCount={10}
        templates={[]}
        onChange={vi.fn()}
      />,
    );

    expect(markup).toContain("Saved setup Ideas");
    expect(markup).toContain("Fresh setup");
    expect(markup).toContain(
      "Save a Stitch as an Idea to reuse its setup here.",
    );
    expect(markup).not.toContain("Stitchr templates");
  });
});
