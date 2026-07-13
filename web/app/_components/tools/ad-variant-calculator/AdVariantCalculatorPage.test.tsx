import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AdVariantCalculatorRoutePage, {
  metadata,
} from "@/app/(content)/tools/ad-variant-calculator/page";

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: vi.fn(),
}));

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: () => (
    <section>
      Join the ClipStitchr mailing list. ClipStitchr is a paid product.
    </section>
  ),
}));

describe("AdVariantCalculatorPage", () => {
  it("renders the calculator, immediate example results, guidance, and paid CTA", () => {
    const markup = renderToStaticMarkup(<AdVariantCalculatorRoutePage />);

    expect(markup).toContain("Ad Variant Calculator for App Marketing");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("UGC clips");
    expect(markup).toContain("Product demos");
    expect(markup).toContain("Calls to action");
    expect(markup).toContain("UGC + demo pairings");
    expect(markup).toContain("Possible test combinations");
    expect(markup).toContain("Practical first batch");
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("Updated plan: 16 pairings");
    expect(markup).toContain("A simpler way to test this many ideas");
    expect(markup).toContain("Join the ClipStitchr mailing list");
    expect(markup).toContain("ClipStitchr is a paid product");
    expect(markup).toContain("See ClipStitchr plans");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain(
      'href="/tools/app-ad-creative-testing-blueprint-builder"',
    );
    expect(markup).toContain('href="/tools"');
    expect(markup).toContain("App Ad Creative Testing Blueprint Builder");
    expect(markup).not.toContain("Start free");
    expect(markup).not.toContain("free trial");
  });

  it("publishes canonical metadata for the calculator route", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/ad-variant-calculator",
    );
    expect(metadata.openGraph).toMatchObject({
      title: "Ad Variant Calculator for App Marketing | ClipStitchr",
    });
  });
});
