import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppAdCreativeFatigueRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-ad-creative-fatigue-calculator/page";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}</section>
  ),
}));

describe("AppAdCreativeFatiguePage", () => {
  it("renders a useful exposure model without a performance promise", () => {
    const markup = renderToStaticMarkup(<AppAdCreativeFatigueRoutePage />);

    expect(markup).toContain("App-Ad Creative Fatigue Calculator");
    expect(markup).toContain("2.80x modeled frequency");
    expect(markup).toContain("15.0");
    expect(markup).toContain(
      "Mailing list source: app-ad-creative-fatigue-calculator",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).not.toContain("guaranteed refresh date");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ad-creative-fatigue-calculator",
    );
  });
});
