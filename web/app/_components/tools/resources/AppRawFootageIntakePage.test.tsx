import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppRawFootageIntakeRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-raw-footage-intake-checklist/page";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}. ClipStitchr is paid.</section>
  ),
}));

describe("AppRawFootageIntakePage", () => {
  it("renders selectable footage roles and the complete handoff request", () => {
    const markup = renderToStaticMarkup(<AppRawFootageIntakeRoutePage />);

    expect(markup).toContain("App Raw Footage Intake Checklist");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("Choose the footage roles");
    expect(markup).toContain("Consent evidence and owner");
    expect(markup).toContain("Delivery service and deadline");
    expect(markup).toContain("Download Markdown");
    expect(markup).toContain(
      "Mailing list source: app-raw-footage-intake-checklist",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).not.toContain("Upload footage here");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-raw-footage-intake-checklist",
    );
  });
});
