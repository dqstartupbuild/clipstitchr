import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppUgcCostCalculatorRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-ugc-cost-calculator/page";

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: vi.fn(),
}));

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}. ClipStitchr is paid.</section>
  ),
}));

describe("AppUgcCostCalculatorPage", () => {
  it("renders a bounded production estimate and honest paid conversion", () => {
    const markup = renderToStaticMarkup(<AppUgcCostCalculatorRoutePage />);

    expect(markup).toContain("App UGC Production Cost Calculator");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("Fee per creator");
    expect(markup).toContain("Editing hours");
    expect(markup).toContain("Estimated production subtotal");
    expect(markup).toContain("$2,040");
    expect(markup).toContain("$255");
    expect(markup).toContain("$330");
    expect(markup).toContain("not added a second time");
    expect(markup).toContain("Mailing list source: app-ugc-cost-calculator");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain('href="/tools/app-ugc-brief-builder"');
    expect(markup).not.toContain("guaranteed savings");
    expect(markup).not.toContain("free trial");
    expect(markup).not.toContain("Start free");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ugc-cost-calculator",
    );
  });
});
