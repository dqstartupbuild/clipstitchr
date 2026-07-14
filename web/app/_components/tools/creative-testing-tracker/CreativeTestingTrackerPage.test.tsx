import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import CreativeTestingTrackerRoutePage, {
  metadata,
} from "@/app/(content)/tools/tiktok-reels-creative-testing-tracker/page";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}</section>
  ),
}));

vi.mock(
  "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest",
  () => ({
    resolvePublicToolGateVariantForRequest: vi.fn(async () => "control"),
  }),
);

describe("CreativeTestingTrackerPage", () => {
  it("renders an immediate editable tracker with honest formula states and exports", async () => {
    const markup = renderToStaticMarkup(
      await CreativeTestingTrackerRoutePage(),
    );

    expect(markup).toContain("TikTok and Reels Creative Testing Tracker");
    expect(markup).toContain("Add impressions to calculate CTR");
    expect(markup).toContain("Download CSV");
    expect(markup).toContain("Download Markdown");
    expect(markup).toContain("Add experiment");
    expect(markup).toContain(
      "Mailing list source: tiktok-reels-creative-testing-tracker",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).not.toContain("Connect ad account");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/tiktok-reels-creative-testing-tracker",
    );
  });
});
