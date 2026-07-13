import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppAdCreativeTestingBlueprintRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-ad-creative-testing-blueprint-builder/page";

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

describe("AppAdCreativeTestingBlueprintPage", () => {
  it("renders a substantive blueprint, exact lead source, and paid handoff", () => {
    const markup = renderToStaticMarkup(
      <AppAdCreativeTestingBlueprintRoutePage />,
    );

    expect(markup).toContain("App Ad Creative Testing Blueprint Builder");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("Testing objective");
    expect(markup).toContain("Campaign stage");
    expect(markup).toContain("Hypothesis lanes and one-variable cells");
    expect(markup).toContain("Audience-message fit");
    expect(markup).toContain("Hook direction");
    expect(markup).toContain("Proof and objection");
    expect(markup).toContain("Control");
    expect(markup).toContain("Challenger A");
    expect(markup).toContain("Measurement contract");
    expect(markup).toContain("Source-asset gaps");
    expect(markup).toContain("Decision rubric");
    expect(markup).toContain("Copy blueprint");
    expect(markup).toContain(
      "Mailing list source: app-ad-creative-testing-blueprint-builder",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain('href="/tools/app-ad-test-plan-generator"');
    expect(markup).toContain('href="/tools/ad-variant-calculator"');
    expect(markup).toContain("not a benchmark");
    expect(markup).toContain("does not produce finished creative");
    expect(markup).not.toContain("free trial");
    expect(markup).not.toContain("Start free");
    expect(markup).not.toContain("guaranteed winner");
  });

  it("publishes canonical metadata and focused keywords", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ad-creative-testing-blueprint-builder",
    );
    expect(metadata.keywords).toContain("creative testing blueprint builder");
  });
});
