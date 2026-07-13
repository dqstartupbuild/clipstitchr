import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppAdHookStructuresRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-ad-hook-structures/page";

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

describe("AppAdHookStructuresRoutePage", () => {
  it("renders all 50 documented frameworks and the paid handoff", () => {
    const markup = renderToStaticMarkup(<AppAdHookStructuresRoutePage />);

    expect(markup).toContain("50 App-Ad Hook Structures");
    expect(markup).toContain("Showing 50 of 50");
    expect(markup).toContain("Problem + product action");
    expect(markup).toContain("The principle behind the feature");
    expect(markup).toContain("Formula:");
    expect(markup).toContain("Misuse warning:");
    expect(markup).toContain("Claim guardrail:");
    expect(markup).toContain("Copy full collection");
    expect(markup).toContain("Mailing list source: app-ad-hook-structures");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain('href="/tools/100-app-demo-video-hooks"');
    expect(markup).not.toContain("proven to convert");
    expect(markup).not.toContain("free trial");
  });

  it("publishes focused canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ad-hook-structures",
    );
    expect(metadata.keywords).toContain("app ad hook structures");
  });
});
