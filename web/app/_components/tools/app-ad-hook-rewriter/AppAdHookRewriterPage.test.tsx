import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AppAdHookRewriterPage } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterPage";
import { AppAdHookRewriterResults } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterResults";
import { metadata } from "@/app/(content)/tools/app-ad-hook-rewriter/page";
import { defaultAppAdHookRewriterInput } from "@/lib/clipstitchr/tools/appAdHookRewriter/defaultAppAdHookRewriterInput";
import { rewriteAppAdHook } from "@/lib/clipstitchr/tools/appAdHookRewriter/rewriteAppAdHook";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <div data-lead-source={source}>Mailing list</div>
  ),
}));

vi.mock(
  "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest",
  () => ({
    resolvePublicToolGateVariantForRequest: vi.fn(async () => "control"),
  }),
);

describe("AppAdHookRewriterPage", () => {
  it("renders the six-direction rewrite workflow and paid conversion path", () => {
    const markup = renderToStaticMarkup(<AppAdHookRewriterPage />);

    expect(markup).toContain("Turn one app hook into six angles");
    expect(markup).toContain("Rewrite this hook");
    expect(markup).toContain('data-lead-source="app-ad-hook-rewriter"');
    expect(markup).toContain('href="/tools/app-ad-hook-grader"');
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
  });

  it("announces and renders six copyable rewrites", () => {
    const result = rewriteAppAdHook(defaultAppAdHookRewriterInput);
    const markup = renderToStaticMarkup(
      <AppAdHookRewriterResults result={result} />,
    );

    expect(markup).toContain('aria-live="polite"');
    expect(markup.match(/Copy rewrite/g)).toHaveLength(6);
    expect(markup).toContain("Pattern break");
    expect(markup).toContain("fresh structure");
    expect(markup).toContain('href="/pricing"');
  });

  it("publishes canonical metadata for the rewriter", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ad-hook-rewriter",
    );
  });
});
