import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import CompetitorHookResearchRoutePage, {
  metadata,
} from "@/app/(content)/tools/competitor-hook-research-worksheet/page";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}</section>
  ),
}));

describe("CompetitorHookResearchPage", () => {
  it("separates entered evidence from visitor inference", () => {
    const markup = renderToStaticMarkup(<CompetitorHookResearchRoutePage />);

    expect(markup).toContain("Competitor Hook Research Worksheet");
    expect(markup).toContain("Evidence entered");
    expect(markup).toContain("Inferences to validate");
    expect(markup).toContain("Still doing this by hand?");
    expect(markup).toContain("Download notes");
    expect(markup).toContain(
      "Mailing list source: competitor-hook-research-worksheet",
    );
    expect(markup).toContain('href="/pricing"');
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/competitor-hook-research-worksheet",
    );
  });
});
