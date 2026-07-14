import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import VideoCompressionEstimatorRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-video-compression-estimator/page";

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

describe("VideoCompressionEstimatorPage", () => {
  it("renders the formula, local boundary, estimate, and conversion path", async () => {
    const markup = renderToStaticMarkup(await VideoCompressionEstimatorRoutePage());

    expect(markup).toContain("App Video Compression Estimator");
    expect(markup).toContain("Choose a video to fill in local facts");
    expect(markup).toContain("14 MB to 16 MB");
    expect(markup).toContain("The center estimate is bitrate × duration ÷ 8");
    expect(markup).toContain("does not transcode, compress, repair, upload");
    expect(markup).toContain(
      "Mailing list source: app-video-compression-estimator",
    );
    expect(markup).toContain('href="/pricing"');
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-video-compression-estimator",
    );
  });
});
