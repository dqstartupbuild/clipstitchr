import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AppAdHookGraderPage } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGraderPage";
import { AppAdHookGraderResults } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGraderResults";
import { metadata } from "@/app/(content)/tools/app-ad-hook-grader/page";
import { defaultAppAdHookGraderInput } from "@/lib/clipstitchr/tools/appAdHookGrader/defaultAppAdHookGraderInput";
import { gradeAppAdHook } from "@/lib/clipstitchr/tools/appAdHookGrader/gradeAppAdHook";

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

describe("AppAdHookGraderPage", () => {
  it("renders the local grader, SEO content, and paid conversion path", () => {
    const markup = renderToStaticMarkup(<AppAdHookGraderPage />);

    expect(markup).toContain("See what your hook communicates");
    expect(markup).toContain("Grade this hook");
    expect(markup).toContain('data-lead-source="app-ad-hook-grader"');
    expect(markup).toContain('href="/tools/app-ad-hook-rewriter"');
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
  });

  it("announces a transparent score and renders all dimensions", () => {
    const result = gradeAppAdHook(defaultAppAdHookGraderInput);
    const markup = renderToStaticMarkup(
      <AppAdHookGraderResults result={result} />,
    );

    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("not a prediction of views");
    expect(markup).toContain("Claim safety");
    expect(markup).toContain("Fix these first");
    expect(markup).toContain('href="/pricing"');
  });

  it("publishes canonical metadata for the grader", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ad-hook-grader",
    );
  });
});
