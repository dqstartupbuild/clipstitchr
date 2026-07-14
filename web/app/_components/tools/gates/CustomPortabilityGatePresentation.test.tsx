import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppHookTestingMatrixPage } from "@/app/_components/tools/app-hook-testing-matrix/AppHookTestingMatrixPage";
import { AppMarketingContentCalendarPage } from "@/app/_components/tools/app-marketing-content-calendar/AppMarketingContentCalendarPage";
import { CompetitorHookResearchPage } from "@/app/_components/tools/competitor-hook-research/CompetitorHookResearchPage";
import { CreativeAssetInventoryPage } from "@/app/_components/tools/creative-asset-inventory/CreativeAssetInventoryPage";
import { CreativeTestingTrackerPage } from "@/app/_components/tools/creative-testing-tracker/CreativeTestingTrackerPage";
import { NotionKitPage } from "@/app/_components/tools/notion-kit/NotionKitPage";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

const mocks = vi.hoisted(() => ({
  isBrowserUnlocked: false,
}));

vi.mock(
  "@/lib/clipstitchr/tools/publicToolGates/usePublicToolBrowserUnlock",
  () => ({
    usePublicToolBrowserUnlock: () => mocks.isBrowserUnlocked,
  }),
);

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({
    outcomeCta,
    source,
  }: {
    outcomeCta?: string;
    source: string;
  }) => <aside>Capture: {outcomeCta ?? `control:${source}`}</aside>,
}));

const functionalCases: readonly {
  gatedLabel: string;
  publicLabel: string;
  render: () => React.ReactElement;
  toolKey: PublicToolKey;
}[] = [
  {
    gatedLabel: "Download CSV matrix",
    publicLabel: "Controlled matrix",
    render: () => <AppHookTestingMatrixPage variant="hybrid-v1" />,
    toolKey: "app-hook-testing-matrix",
  },
  {
    gatedLabel: "Download CSV",
    publicLabel: "Add experiment",
    render: () => <CreativeTestingTrackerPage variant="hybrid-v1" />,
    toolKey: "tiktok-reels-creative-testing-tracker",
  },
  {
    gatedLabel: "Download CSV",
    publicLabel: "Editable calendar",
    render: () => <AppMarketingContentCalendarPage variant="hybrid-v1" />,
    toolKey: "app-marketing-content-calendar",
  },
  {
    gatedLabel: "Download notes",
    publicLabel: "Research summary",
    render: () => <CompetitorHookResearchPage variant="hybrid-v1" />,
    toolKey: "competitor-hook-research-worksheet",
  },
  {
    gatedLabel: "Download CSV",
    publicLabel: "Current coverage",
    render: () => <CreativeAssetInventoryPage variant="hybrid-v1" />,
    toolKey: "app-creative-asset-inventory-template",
  },
  {
    gatedLabel: "Download Idea Bank CSV",
    publicLabel: "Five real CSV files",
    render: () => <NotionKitPage variant="hybrid-v1" />,
    toolKey: "short-form-content-system-notion-kit",
  },
];

describe("custom portability gate presentation", () => {
  beforeEach(() => {
    mocks.isBrowserUnlocked = false;
  });

  it.each(functionalCases)(
    "keeps $toolKey usable while its exact artifact is locked",
    ({ gatedLabel, publicLabel, render, toolKey }) => {
      const markup = renderToStaticMarkup(render());

      expect(markup).toContain(publicLabel);
      expect(markup).not.toContain(gatedLabel);
      expect(markup).toContain(getPublicToolGateMetadata(toolKey).outcomeCta);
    },
  );

  it.each(functionalCases)(
    "restores the $toolKey artifact after the shared browser unlock",
    ({ gatedLabel, render }) => {
      mocks.isBrowserUnlocked = true;
      const markup = renderToStaticMarkup(render());

      expect(markup).toContain(gatedLabel);
      expect(markup).not.toContain("Capture:");
    },
  );

  it("leaves non-approved convenience formats public", () => {
    const trackerMarkup = renderToStaticMarkup(
      <CreativeTestingTrackerPage variant="hybrid-v1" />,
    );
    const inventoryMarkup = renderToStaticMarkup(
      <CreativeAssetInventoryPage variant="hybrid-v1" />,
    );

    expect(trackerMarkup).toContain("Download Markdown");
    expect(inventoryMarkup).toContain("Download Markdown");
  });
});
