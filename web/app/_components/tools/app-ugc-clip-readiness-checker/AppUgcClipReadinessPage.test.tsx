import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppUgcClipReadinessRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-ugc-clip-readiness-checker/page";
import { AppUgcClipReadinessResults } from "@/app/_components/tools/app-ugc-clip-readiness-checker/AppUgcClipReadinessResults";
import type { AppUgcClipAnswers } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipAnswers";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: vi.fn(),
}));
vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: vi.fn(),
}));
vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}. ClipStitchr is paid.</section>
  ),
}));

const answers: AppUgcClipAnswers = {
  "center-safe-framing": "yes",
  "opening-motion": "yes",
  "spoken-clarity": "yes",
  "clean-handles": "yes",
  "single-beat": "yes",
  "clean-source": "yes",
  "usage-approved": "yes",
};

const inspection: LocalVideoInspection = {
  aspectRatio: 9 / 16,
  audioBitrate: 160_000,
  audioCanDecode: true,
  audioChannels: 2,
  audioCodec: "aac",
  audioCodecParameter: "mp4a.40.2",
  audioSampleRate: 48_000,
  audioTrackCount: 1,
  duration: 5,
  fileName: "ugc.mp4",
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

vi.mock(
  "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest",
  () => ({
    resolvePublicToolGateVariantForRequest: vi.fn(async () => "control"),
  }),
);

describe("AppUgcClipReadinessPage", () => {
  it("renders the local-only self-review and exact lead source", async () => {
    const markup = renderToStaticMarkup(await AppUgcClipReadinessRoutePage());

    expect(markup).toContain("App UGC Clip Readiness Checker");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("The browser does not detect composition");
    expect(markup).toContain("Drop one raw UGC clip here");
    expect(markup).toContain(
      "Mailing list source: app-ugc-clip-readiness-checker",
    );
    expect(markup).toContain('href="/tools"');
    expect(markup).not.toContain("free trial");
  });

  it("separates automatic facts from confirmed self-review", () => {
    const markup = renderToStaticMarkup(
      <AppUgcClipReadinessResults
        answers={answers}
        file={new File(["video"], "ugc.mp4", { type: "video/mp4" })}
        inspection={inspection}
        role="spoken-hook"
      />,
    );

    expect(markup).toContain("100%");
    expect(markup).toContain("Ready to reuse");
    expect(markup).toContain("Automatic file facts");
    expect(markup).toContain("Your self-review");
    expect(markup).toContain("Copy clip report");
    expect(markup).toContain('href="/pricing"');
    expect(markup).not.toContain("repair your clip");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-ugc-clip-readiness-checker",
    );
  });
});
