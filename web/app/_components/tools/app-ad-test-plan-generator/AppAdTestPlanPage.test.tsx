import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppAdTestPlanRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-ad-test-plan-generator/page";

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

describe("AppAdTestPlanPage", () => {
  it("renders a three-wave plan, copy action, lead source, and paid CTA", async () => {
    const markup = renderToStaticMarkup(await AppAdTestPlanRoutePage());

    expect(markup).toContain("App Ad Creative Test Plan Generator");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("UGC openings");
    expect(markup).toContain("Weekly production capacity");
    expect(markup).toContain("Copy full plan");
    expect(markup).toContain("Wave 1");
    expect(markup).toContain("Wave 2");
    expect(markup).toContain("Wave 3");
    expect(markup).toContain("Mailing list source: app-ad-test-plan-generator");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain('href="/tools/ad-variant-calculator"');
    expect(markup).not.toContain("free trial");
    expect(markup).not.toContain("Start free");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ad-test-plan-generator",
    );
  });
});
