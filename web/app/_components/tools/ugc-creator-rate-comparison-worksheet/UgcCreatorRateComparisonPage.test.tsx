import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import UgcCreatorRateComparisonRoutePage, {
  metadata,
} from "@/app/(content)/tools/ugc-creator-rate-comparison-worksheet/page";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}</section>
  ),
}));

describe("UgcCreatorRateComparisonPage", () => {
  it("compares the entered set without an outside benchmark", () => {
    const markup = renderToStaticMarkup(<UgcCreatorRateComparisonRoutePage />);

    expect(markup).toContain("UGC Creator Rate Comparison Worksheet");
    expect(markup).toContain("3 quotes normalized");
    expect(markup).toContain("$1,000.00");
    expect(markup).toContain("Raw footage: listed as included");
    expect(markup).toContain(
      "Mailing list source: ugc-creator-rate-comparison-worksheet",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain("not a market benchmark");
    expect(markup).not.toContain("industry average");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/ugc-creator-rate-comparison-worksheet",
    );
  });
});
