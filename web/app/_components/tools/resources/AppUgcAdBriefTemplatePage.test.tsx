import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppUgcAdBriefTemplateRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-ugc-ad-brief-template/page";

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

describe("AppUgcAdBriefTemplatePage", () => {
  it("renders the blank brief, example, immediate download, and paid path", async () => {
    const markup = renderToStaticMarkup(await AppUgcAdBriefTemplateRoutePage());

    expect(markup).toContain("App UGC Ad Brief Template");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("Blank brief — strategy and guardrails");
    expect(markup).toContain("Complete fictional example");
    expect(markup).toContain("TempoList");
    expect(markup).toContain("Download Markdown");
    expect(markup).toContain("Mailing list source: app-ugc-ad-brief-template");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain('href="/tools"');
    expect(markup).not.toContain("We’ll email");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ugc-ad-brief-template",
    );
  });
});
