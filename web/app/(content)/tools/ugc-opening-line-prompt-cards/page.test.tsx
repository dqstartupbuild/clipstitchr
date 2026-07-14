import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import UgcOpeningLinePromptCardsRoutePage, {
  metadata,
} from "@/app/(content)/tools/ugc-opening-line-prompt-cards/page";

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

describe("UgcOpeningLinePromptCardsRoutePage", () => {
  it("renders all 24 creator prompts with recording guidance", async () => {
    const markup = renderToStaticMarkup(
      await UgcOpeningLinePromptCardsRoutePage(),
    );

    expect(markup).toContain("UGC Opening-Line Prompt Cards");
    expect(markup).toContain("Showing 24 of 24");
    expect(markup).toContain("The recurring annoyance");
    expect(markup).toContain("The reusable result");
    expect(markup).toContain("Delivery:");
    expect(markup).toContain("Alternate take:");
    expect(markup).toContain("Proof guardrail:");
    expect(markup).toContain("Copy full collection");
    expect(markup).toContain(
      "Mailing list source: ugc-opening-line-prompt-cards",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain('href="/tools/app-ad-shot-list-generator"');
    expect(markup).toContain("source capture only");
    expect(markup).not.toContain("free trial");
  });

  it("publishes focused canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/ugc-opening-line-prompt-cards",
    );
    expect(metadata.keywords).toContain("UGC opening line prompts");
  });
});
