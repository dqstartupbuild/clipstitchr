import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppDemoVideoHooksRoutePage, {
  metadata,
} from "@/app/(content)/tools/100-app-demo-video-hooks/page";

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

describe("AppDemoVideoHooksRoutePage", () => {
  it("renders all 100 hooks with useful context and the paid handoff", async () => {
    const markup = renderToStaticMarkup(await AppDemoVideoHooksRoutePage());

    expect(markup).toContain("100 Hooks for App Demo Videos");
    expect(markup).toContain("Showing 100 of 100");
    expect(markup).toContain("The repeat task");
    expect(markup).toContain("The boundary demo");
    expect(markup).toContain("Opening visual:");
    expect(markup).toContain("Claim check:");
    expect(markup).toContain("Copy full collection");
    expect(markup).toContain("Download collection");
    expect(markup).toContain("Mailing list source: 100-app-demo-video-hooks");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain('href="/tools/app-ad-hook-structures"');
    expect(markup).not.toContain("free trial");
    expect(markup).not.toContain("guaranteed winner");
  });

  it("publishes focused canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/100-app-demo-video-hooks",
    );
    expect(metadata.keywords).toContain("app demo video hooks");
  });
});
