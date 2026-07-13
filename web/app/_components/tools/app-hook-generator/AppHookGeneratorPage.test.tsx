import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppHookGeneratorRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-hook-generator/page";
import { AppHookGeneratorResults } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorResults";

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

describe("AppHookGeneratorPage", () => {
  it("renders the tool inputs, usage guidance, and privacy promise", () => {
    const markup = renderToStaticMarkup(<AppHookGeneratorRoutePage />);

    expect(markup).toContain("App Hook Generator for Short-Form Ads");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("App name");
    expect(markup).toContain("Who is it for?");
    expect(markup).toContain("What problem does it help with?");
    expect(markup).toContain("What do they want instead?");
    expect(markup).toContain("Generate 8 hooks");
    expect(markup).toContain("Safe");
    expect(markup).toContain("Punchy");
    expect(markup).toContain("Bold");
    expect(markup).toContain(
      "The best hook makes the next shot feel necessary.",
    );
    expect(markup).toContain("analytics do not include your inputs");
    expect(markup).toContain("Join the ClipStitchr mailing list");
    expect(markup).toContain("ClipStitchr is a paid product");
    expect(markup).toContain('href="/tools/app-ad-hook-grader"');
    expect(markup).toContain('href="/tools/app-ad-hook-rewriter"');
    expect(markup).toContain('href="/tools"');
    expect(markup).toContain("Hook Strength Grader for App Ads");
  });

  it("renders eight public hook fields and a paid CTA after generation", () => {
    const result = {
      hooks: Array.from({ length: 8 }, (_, index) => ({
        angle: `Angle ${index + 1}`,
        reason: `Reason ${index + 1}`,
        text: `Hook ${index + 1}`,
      })),
      variationIndex: 2,
    };
    const markup = renderToStaticMarkup(
      <AppHookGeneratorResults
        isLoading={false}
        result={result}
        onRegenerate={() => undefined}
      />,
    );

    expect(markup).toContain("Hook 1");
    expect(markup).toContain("Hook 8");
    expect(markup).toContain("Another set");
    expect(markup).toContain("See ClipStitchr plans");
    expect(markup).toContain('href="/pricing"');
    expect(markup).not.toContain("templateId");
    expect(markup).not.toContain("risk");
    expect(markup).not.toContain("Start free");
    expect(markup).not.toContain("free trial");
  });

  it("publishes canonical metadata for the generator route", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-hook-generator",
    );
    expect(metadata.openGraph).toMatchObject({
      title: "App Hook Generator for Short-Form Ads | ClipStitchr",
    });
  });
});
