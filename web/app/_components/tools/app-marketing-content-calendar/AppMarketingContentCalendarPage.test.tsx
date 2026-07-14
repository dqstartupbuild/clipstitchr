import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppMarketingContentCalendarRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-marketing-content-calendar/page";

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

describe("AppMarketingContentCalendarPage", () => {
  it("renders editable calendar rows and CSV export", async () => {
    const markup = renderToStaticMarkup(
      await AppMarketingContentCalendarRoutePage(),
    );

    expect(markup).toContain("App Marketing Content Calendar");
    expect(markup).toContain("publishing slots");
    expect(markup).toContain("Campaign: Paid launch");
    expect(markup).toContain("Download CSV");
    expect(markup).toContain(
      "Mailing list source: app-marketing-content-calendar",
    );
    expect(markup).toContain('href="/pricing"');
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-marketing-content-calendar",
    );
  });
});
