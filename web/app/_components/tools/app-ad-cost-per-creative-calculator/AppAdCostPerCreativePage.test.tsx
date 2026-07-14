import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppAdCostPerCreativeRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-ad-cost-per-creative-calculator/page";
import { AppAdCostPerCreativeResults } from "@/app/_components/tools/app-ad-cost-per-creative-calculator/AppAdCostPerCreativeResults";
import { calculateAppAdCostPerCreative } from "@/lib/clipstitchr/tools/appAdCostPerCreative/calculateAppAdCostPerCreative";
import { defaultAppAdCostPerCreativeInput } from "@/lib/clipstitchr/tools/appAdCostPerCreative/defaultAppAdCostPerCreativeInput";

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

vi.mock(
  "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest",
  () => ({
    resolvePublicToolGateVariantForRequest: vi.fn(async () => "control"),
  }),
);

describe("AppAdCostPerCreativePage", () => {
  it("renders the reuse comparison and honest paid conversion", async () => {
    const markup = renderToStaticMarkup(await AppAdCostPerCreativeRoutePage());

    expect(markup).toContain("App Ad Cost per Creative Calculator");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("Source-footage cost");
    expect(markup).toContain("Current cost per publishable creative");
    expect(markup).toContain("$250");
    expect(markup).toContain("$150.00 blended cost per creative");
    expect(markup).toContain("lower by $100.00");
    expect(markup).toContain(
      "Mailing list source: app-ad-cost-per-creative-calculator",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain('href="/tools/app-ugc-cost-calculator"');
    expect(markup).not.toContain("guaranteed savings");
    expect(markup).not.toContain("free trial");
    expect(markup).not.toContain("Start free");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ad-cost-per-creative-calculator",
    );
  });

  it("shows a useful empty scenario instead of fabricated comparison values", () => {
    const result = calculateAppAdCostPerCreative({
      ...defaultAppAdCostPerCreativeInput,
      currentCreativeCount: 0,
      additionalCreativeCount: 0,
      additionalFinishingCost: 900,
    });
    const markup = renderToStaticMarkup(
      <AppAdCostPerCreativeResults result={result} />,
    );

    expect(markup).toContain("Add current creatives");
    expect(markup).toContain(
      "Add planned creatives to compare a reuse scenario",
    );
    expect(markup).toContain("not included until at least one");
    expect(markup).not.toContain("$900.00");
  });
});
