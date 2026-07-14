import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppAdBreakEvenRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-ad-break-even-calculator/page";
import { AppAdBreakEvenResults } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenResults";
import { calculateAppAdBreakEven } from "@/lib/clipstitchr/tools/appAdBreakEven/calculateAppAdBreakEven";
import { defaultAppAdBreakEvenInput } from "@/lib/clipstitchr/tools/appAdBreakEven/defaultAppAdBreakEvenInput";

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

describe("AppAdBreakEvenPage", () => {
  it("renders transparent break-even targets and an honest paid conversion", async () => {
    const markup = renderToStaticMarkup(await AppAdBreakEvenRoutePage());

    expect(markup).toContain("App Ad Break-Even Calculator");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("Contribution margin");
    expect(markup).toContain("Break-even paying customers");
    expect(markup).toContain(">67<");
    expect(markup).toContain(">1,340<");
    expect(markup).toContain("$8,000");
    expect(markup).toContain("1.60x");
    expect(markup).toContain("not a spend recommendation");
    expect(markup).toContain(
      "Mailing list source: app-ad-break-even-calculator",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain(
      'href="/tools/app-ad-cost-per-creative-calculator"',
    );
    expect(markup).not.toContain("guaranteed performance");
    expect(markup).not.toContain("free trial");
    expect(markup).not.toContain("Start free");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ad-break-even-calculator",
    );
  });

  it("keeps missing customer value and conversion assumptions explicit", () => {
    const missingCustomerValue = calculateAppAdBreakEven({
      ...defaultAppAdBreakEvenInput,
      contributionMarginPercentage: 0,
    });
    const missingConversionRate = calculateAppAdBreakEven({
      ...defaultAppAdBreakEvenInput,
      installToPaidPercentage: 0,
    });
    const outsideInstallRange = calculateAppAdBreakEven({
      ...defaultAppAdBreakEvenInput,
      mediaSpend: 10_000_000,
      creativeProductionCost: 1_000_000,
      revenuePerPayingCustomer: 0.01,
      contributionMarginPercentage: 0.01,
      installToPaidPercentage: 0.01,
    });
    const customerMarkup = renderToStaticMarkup(
      <AppAdBreakEvenResults result={missingCustomerValue} />,
    );
    const installMarkup = renderToStaticMarkup(
      <AppAdBreakEvenResults result={missingConversionRate} />,
    );
    const outsideRangeMarkup = renderToStaticMarkup(
      <AppAdBreakEvenResults result={outsideInstallRange} />,
    );

    expect(customerMarkup).toContain("Add customer value");
    expect(customerMarkup).toContain(
      "Add positive revenue per customer and contribution margin",
    );
    expect(installMarkup).toContain("Add conversion rate");
    expect(outsideRangeMarkup).toContain("Outside useful range");
    expect(outsideRangeMarkup).toContain(
      "whole-install target larger than this calculator can show safely",
    );
    expect(customerMarkup).not.toContain("Infinity");
    expect(installMarkup).not.toContain("NaN");
  });
});
