import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ShortFormAdPreflightRoutePage, {
  metadata,
} from "@/app/(content)/tools/short-form-ad-preflight-checklist/page";

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

describe("ShortFormAdPreflightPage", () => {
  it("renders twenty checks, visible blockers, and no approval promise", async () => {
    const markup = renderToStaticMarkup(await ShortFormAdPreflightRoutePage());

    expect(markup).toContain("Short-Form Ad Preflight Checklist");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("0 of 20 complete");
    expect(markup).toContain("Must check");
    expect(markup).toContain("Rights, privacy, and destination blockers");
    expect(markup).toContain(
      "Mailing list source: short-form-ad-preflight-checklist",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain("No checklist can promise approval");
    expect(markup).not.toContain("Your ad is approved");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/short-form-ad-preflight-checklist",
    );
  });
});
