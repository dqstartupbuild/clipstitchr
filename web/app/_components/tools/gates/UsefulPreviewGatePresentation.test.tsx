import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppAdCreativeTestingBlueprintResults } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/AppAdCreativeTestingBlueprintResults";
import { AppAdTestPlanResults } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanResults";
import { AppUgcBriefBuilderResults } from "@/app/_components/tools/app-ugc-brief-builder/AppUgcBriefBuilderResults";
import { AppUgcClipReadinessResults } from "@/app/_components/tools/app-ugc-clip-readiness-checker/AppUgcClipReadinessResults";
import { ShortFormAuditResults } from "@/app/_components/tools/personalized-short-form-audit/ShortFormAuditResults";
import { ProductDemoReadinessResults } from "@/app/_components/tools/product-demo-readiness-checker/ProductDemoReadinessResults";
import { RawCampaignPlanResults } from "@/app/_components/tools/raw-clips-to-campaign-planner/RawCampaignPlanResults";
import { createAppAdTestPlan } from "@/lib/clipstitchr/tools/appAdTestPlan/createAppAdTestPlan";
import { defaultAppAdTestPlanInput } from "@/lib/clipstitchr/tools/appAdTestPlan/defaultAppAdTestPlanInput";
import { buildAppAdCreativeTestingBlueprint } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/buildAppAdCreativeTestingBlueprint";
import { defaultAppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/defaultAppAdCreativeTestingBlueprintInput";
import { createAppUgcBrief } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/createAppUgcBrief";
import { defaultAppUgcBriefInput } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/defaultAppUgcBriefInput";
import { defaultAppUgcClipAnswers } from "@/lib/clipstitchr/tools/appUgcClipReadiness/defaultAppUgcClipAnswers";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import { calculatePersonalizedShortFormAudit } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/calculatePersonalizedShortFormAudit";
import { defaultShortFormAuditResponses } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/defaultShortFormAuditResponses";
import { defaultProductDemoAnswers } from "@/lib/clipstitchr/tools/productDemoReadiness/defaultProductDemoAnswers";
import { buildRawClipsCampaignPlan } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/buildRawClipsCampaignPlan";
import { defaultRawCampaignAssets } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/defaultRawCampaignAssets";

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
  ToolLeadCaptureForm: () => <aside>Unlock capture</aside>,
}));

const inspection: LocalVideoInspection = {
  aspectRatio: 9 / 16,
  audioBitrate: 160_000,
  audioCanDecode: true,
  audioChannels: 2,
  audioCodec: "aac",
  audioCodecParameter: "mp4a.40.2",
  audioSampleRate: 48_000,
  audioTrackCount: 1,
  duration: 12,
  fileName: "local.mp4",
  fileSize: 4_000_000,
  hasAudio: true,
  hasHighDynamicRange: false,
  height: 1920,
  mimeType: "video/mp4",
  pixelAspectRatio: { den: 1, num: 1 },
  rotation: 0,
  videoBitrate: 4_000_000,
  videoCanDecode: true,
  videoCodec: "avc",
  videoCodecParameter: "avc1.640028",
  videoFrameRate: 30,
  videoTrackCount: 1,
  width: 1080,
};

function createUsefulPreviewCases() {
  const blueprint = buildAppAdCreativeTestingBlueprint(
    defaultAppAdCreativeTestingBlueprintInput,
  );

  if (blueprint.status !== "complete") {
    throw new Error("Default blueprint fixture must be complete.");
  }

  return [
    {
      gatedText: "Full readiness checklist",
      name: "product demo readiness",
      publicText: "Largest blocker",
      view: (
        <ProductDemoReadinessResults
          answers={defaultProductDemoAnswers}
          file={new File(["video"], "local.mp4", { type: "video/mp4" })}
          inspection={inspection}
          use="short-form-ad"
          variant="hybrid-v1"
        />
      ),
    },
    {
      gatedText: "Automatic file facts",
      name: "UGC clip readiness",
      publicText: "Top issue",
      view: (
        <AppUgcClipReadinessResults
          answers={defaultAppUgcClipAnswers}
          file={new File(["video"], "local.mp4", { type: "video/mp4" })}
          inspection={inspection}
          role="spoken-hook"
          variant="hybrid-v1"
        />
      ),
    },
    {
      gatedText: "Weekly order",
      name: "creative test plan",
      publicText: "First test wave",
      view: (
        <AppAdTestPlanResults
          result={createAppAdTestPlan(defaultAppAdTestPlanInput)}
          variant="hybrid-v1"
        />
      ),
    },
    {
      gatedText: "Your dependency-ordered 14-day plan",
      name: "personalized audit",
      publicText: "First priority",
      view: (
        <ShortFormAuditResults
          result={calculatePersonalizedShortFormAudit(
            defaultShortFormAuditResponses,
          )}
          variant="hybrid-v1"
        />
      ),
    },
    {
      gatedText: "Creator direction",
      name: "UGC brief",
      publicText: "Objective",
      view: (
        <AppUgcBriefBuilderResults
          result={createAppUgcBrief(defaultAppUgcBriefInput)}
          variant="hybrid-v1"
        />
      ),
    },
    {
      gatedText: "Source-asset gaps",
      name: "creative testing blueprint",
      publicText: "First experiment",
      view: (
        <AppAdCreativeTestingBlueprintResults
          build={blueprint}
          variant="hybrid-v1"
        />
      ),
    },
    {
      gatedText: "Missing captures",
      name: "raw clips campaign plan",
      publicText: "Strongest clip combination",
      view: (
        <RawCampaignPlanResults
          assets={defaultRawCampaignAssets}
          plan={buildRawClipsCampaignPlan(defaultRawCampaignAssets)}
          variant="hybrid-v1"
        />
      ),
    },
  ];
}

describe("useful-preview gate presentation", () => {
  beforeEach(() => {
    mocks.isBrowserUnlocked = false;
  });

  it.each(createUsefulPreviewCases())(
    "keeps $name useful before capture",
    ({ gatedText, publicText, view }) => {
      const markup = renderToStaticMarkup(view);

      expect(markup).toContain(publicText);
      expect(markup).not.toContain(gatedText);
      expect(markup).toContain("Unlock capture");
    },
  );

  it.each(createUsefulPreviewCases())(
    "restores the complete $name after browser unlock",
    ({ gatedText, publicText, view }) => {
      mocks.isBrowserUnlocked = true;
      const markup = renderToStaticMarkup(view);

      expect(markup).toContain(publicText);
      expect(markup).toContain(gatedText);
      expect(markup).not.toContain("Unlock capture");
    },
  );
});
