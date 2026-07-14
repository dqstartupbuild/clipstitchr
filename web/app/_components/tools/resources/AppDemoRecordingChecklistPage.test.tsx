import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppDemoRecordingChecklistRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-demo-recording-checklist/page";

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

describe("AppDemoRecordingChecklistPage", () => {
  it("renders eighteen capture checks, blockers, and the paid path", async () => {
    const markup = renderToStaticMarkup(await AppDemoRecordingChecklistRoutePage());

    expect(markup).toContain("Product Demo Recording Checklist");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("0 of 18 complete");
    expect(markup).toContain("Choose one capture method");
    expect(markup).toContain("Must check");
    expect(markup).toContain("Download Markdown");
    expect(markup).toContain(
      "Mailing list source: app-demo-recording-checklist",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).not.toContain("upload your demo");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-demo-recording-checklist",
    );
  });
});
