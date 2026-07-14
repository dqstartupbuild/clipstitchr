import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import RawCampaignPlannerRoutePage, {
  metadata,
} from "@/app/(content)/tools/raw-clips-to-campaign-planner/page";

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

describe("RawCampaignPlannerPage", () => {
  it("renders six text-only concepts, coverage, reuse, missing captures, and Markdown", async () => {
    const markup = renderToStaticMarkup(await RawCampaignPlannerRoutePage());

    expect(markup).toContain("Raw Clips to Campaign Planner");
    expect(markup).toContain("Text-only inventory");
    expect(markup).toContain("6 campaign concepts from 9 named assets");
    expect(markup.match(/Concept [1-6]/g)).toHaveLength(6);
    expect(markup).toContain("100% role coverage");
    expect(markup).toContain("Missing captures");
    expect(markup).toContain("Reuse map");
    expect(markup).toContain("Copy Markdown handoff");
    expect(markup).toContain("No uploads, asset storage, stitching");
    expect(markup).toContain(
      "Mailing list source: raw-clips-to-campaign-planner",
    );
    expect(markup).toContain('href="/pricing"');
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/raw-clips-to-campaign-planner",
    );
  });
});
