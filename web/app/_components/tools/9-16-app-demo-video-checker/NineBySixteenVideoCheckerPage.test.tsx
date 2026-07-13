import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import NineBySixteenVideoCheckerRoutePage, {
  metadata,
} from "@/app/(content)/tools/9-16-app-demo-video-checker/page";
import { NineBySixteenVideoCheckerResults } from "@/app/_components/tools/9-16-app-demo-video-checker/NineBySixteenVideoCheckerResults";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/analytics/trackTikTokButtonClick", () => ({
  trackTikTokButtonClick: vi.fn(),
}));

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>
      Join the ClipStitchr mailing list from {source}. ClipStitchr is a paid
      product.
    </section>
  ),
}));

describe("NineBySixteenVideoCheckerPage", () => {
  it("renders local-only guidance, structured data, lead source, and discovery", () => {
    const markup = renderToStaticMarkup(
      <NineBySixteenVideoCheckerRoutePage />,
    );

    expect(markup).toContain("9:16 App Demo Video Checker");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("Is this demo ready for a 9:16 ad?");
    expect(markup).toContain("never uploaded");
    expect(markup).toContain("9-16-app-demo-video-checker");
    expect(markup).toContain("ClipStitchr is a paid product");
    expect(markup).toContain('href="/tools/product-demo-readiness-checker"');
    expect(markup).toContain('href="/tools/hook-to-visual-matchmaker"');
    expect(markup).toContain('href="/tools"');
    expect(markup).not.toContain("free trial");
  });

  it("renders the scored facts, checks, and paid plan CTA", () => {
    const inspection: LocalVideoInspection = {
      aspectRatio: 9 / 16,
      audioBitrate: 160_000,
      audioCanDecode: true,
      audioChannels: 2,
      audioCodec: "aac",
      audioCodecParameter: "mp4a.40.2",
      audioSampleRate: 48_000,
      audioTrackCount: 1,
      duration: 18,
      fileName: "demo.mp4",
      fileSize: 12_000_000,
      hasAudio: true,
      hasHighDynamicRange: false,
      height: 1920,
      mimeType: "video/mp4",
      pixelAspectRatio: { den: 1, num: 1 },
      rotation: 0,
      videoBitrate: 8_000_000,
      videoCanDecode: true,
      videoCodec: "avc",
      videoCodecParameter: "avc1.640028",
      videoFrameRate: 30,
      videoTrackCount: 1,
      width: 1080,
    };
    const markup = renderToStaticMarkup(
      <NineBySixteenVideoCheckerResults
        file={new File(["video"], "demo.mp4", { type: "video/mp4" })}
        inspection={inspection}
      />,
    );

    expect(markup).toContain("100%");
    expect(markup).toContain("Ready");
    expect(markup).toContain("1080×1920");
    expect(markup).toContain("30.0 FPS");
    expect(markup).toContain("Your video checklist");
    expect(markup).toContain("See ClipStitchr plans");
    expect(markup).toContain('href="/pricing"');
    expect(markup).not.toContain("Download");
    expect(markup).not.toContain("Start free");
  });

  it("publishes canonical metadata for the checker route", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/9-16-app-demo-video-checker",
    );
    expect(metadata.openGraph).toMatchObject({
      title: "9:16 App Demo Video Checker | ClipStitchr",
    });
  });
});
