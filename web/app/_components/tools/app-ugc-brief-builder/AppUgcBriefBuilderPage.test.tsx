import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppUgcBriefBuilderRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-ugc-brief-builder/page";

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

describe("AppUgcBriefBuilderPage", () => {
  it("renders an immediate copyable brief and paid conversion path", async () => {
    const markup = renderToStaticMarkup(await AppUgcBriefBuilderRoutePage());

    expect(markup).toContain("UGC Ad Brief Builder for Apps");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("What product moment should the demo show?");
    expect(markup).toContain("Copy full brief");
    expect(markup).toContain("Three hook directions");
    expect(markup).toContain("Product-demo handoff");
    expect(markup).toContain("No approved proof was supplied");
    expect(markup).toContain("Mailing list source: app-ugc-brief-builder");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain("See ClipStitchr plans");
    expect(markup).toContain('href="/tools/app-ad-shot-list-generator"');
    expect(markup).not.toContain("free trial");
    expect(markup).not.toContain("Start free");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ugc-brief-builder",
    );
  });
});
