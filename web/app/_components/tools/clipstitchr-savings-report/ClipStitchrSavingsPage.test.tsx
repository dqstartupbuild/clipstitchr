import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ClipStitchrSavingsRoutePage, {
  metadata,
} from "@/app/(content)/tools/clipstitchr-savings-report/page";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}</section>
  ),
}));

describe("ClipStitchrSavingsPage", () => {
  it("renders the transparent default scenario and paid path", () => {
    const markup = renderToStaticMarkup(<ClipStitchrSavingsRoutePage />);

    expect(markup).toContain("Interactive ClipStitchr Savings Report");
    expect(markup).toContain("$1,101.00 less");
    expect(markup).toContain("44.0 hours");
    expect(markup).toContain("80.0%");
    expect(markup).toContain("Starter — $39/month");
    expect(markup).toContain("Mailing list source: clipstitchr-savings-report");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain("not guaranteed savings or output");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/clipstitchr-savings-report",
    );
  });
});
