import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ThirtyDayContentPlanRoutePage, {
  metadata,
} from "@/app/(content)/tools/30-day-app-content-plan/page";

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

describe("ThirtyDayContentPlanPage", () => {
  it("renders all thirty useful actions and the paid boundary", async () => {
    const markup = renderToStaticMarkup(
      await ThirtyDayContentPlanRoutePage(),
    );

    expect(markup).toContain("30-Day Short-Form Content Plan for App Founders");
    expect(markup).toContain("30 useful days");
    expect(markup).toContain("Day 30");
    expect(markup).toContain("Download plan");
    expect(markup).toContain("Mailing list source: 30-day-app-content-plan");
    expect(markup).toContain('href="/pricing"');
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/30-day-app-content-plan",
    );
  });
});
