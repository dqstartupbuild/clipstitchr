import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HookVisualMatchmakerPage } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualMatchmakerPage";
import { HookVisualMatchmakerResults } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualMatchmakerResults";
import { metadata } from "@/app/(content)/tools/hook-to-visual-matchmaker/page";
import { defaultHookVisualMatchmakerInput } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/defaultHookVisualMatchmakerInput";
import { matchHookToVisual } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/matchHookToVisual";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <div data-lead-source={source}>Mailing list</div>
  ),
}));

describe("HookVisualMatchmakerPage", () => {
  it("renders the local footage-aware workflow and paid conversion path", () => {
    const markup = renderToStaticMarkup(<HookVisualMatchmakerPage />);

    expect(markup).toContain("Give your app hook a first shot");
    expect(markup).toContain("Build the opening");
    expect(markup).toContain('data-lead-source="hook-to-visual-matchmaker"');
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
  });

  it("announces and renders a five-second primary and alternate plan", () => {
    const result = matchHookToVisual(defaultHookVisualMatchmakerInput);
    const markup = renderToStaticMarkup(
      <HookVisualMatchmakerResults result={result} />,
    );

    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("0–1.5 sec");
    expect(markup).toContain("3–5 sec");
    expect(markup).toContain("Copy visual plan");
    expect(markup).toContain("Copy alternate");
    expect(markup).toContain("not a performance prediction");
    expect(markup).toContain('href="/pricing"');
  });

  it("publishes canonical metadata for the matchmaker", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/hook-to-visual-matchmaker",
    );
  });
});
