import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppAdShotListRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-ad-shot-list-generator/page";

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: vi.fn(),
}));
vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: vi.fn(),
}));
vi.mock(
  "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest",
  () => ({
    resolvePublicToolGateVariantForRequest: vi.fn(async () => "control"),
  }),
);
vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}. ClipStitchr is paid.</section>
  ),
}));

describe("AppAdShotListPage", () => {
  it("renders an individual capture plan and paid conversion path", async () => {
    const markup = renderToStaticMarkup(await AppAdShotListRoutePage());

    expect(markup).toContain("App Ad Shot List Generator");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("Copy shot list");
    expect(markup).toContain("HOOK-01");
    expect(markup).toContain("DEMO-01");
    expect(markup).toContain("7 planned files");
    expect(markup).toContain("Mailing list source: app-ad-shot-list-generator");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain('href="/tools"');
    expect(markup).not.toContain("free trial");
    expect(markup).not.toContain("Start free");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ad-shot-list-generator",
    );
  });
});
