import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ProductDemoReadinessRoutePage, {
  metadata,
} from "@/app/(content)/tools/product-demo-readiness-checker/page";
import { ProductDemoReadinessResults } from "@/app/_components/tools/product-demo-readiness-checker/ProductDemoReadinessResults";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import type { ProductDemoAnswers } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoAnswers";

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

describe("ProductDemoReadinessPage", () => {
  it("renders the private checklist, structured data, lead source, and discovery", () => {
    const markup = renderToStaticMarkup(<ProductDemoReadinessRoutePage />);

    expect(markup).toContain("Product Demo Readiness Checker");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("Is this product demo ready to test?");
    expect(markup).toContain("Where will this demo run first?");
    expect(markup).toContain("first two seconds");
    expect(markup).toContain("Personal, secret, and customer data is hidden");
    expect(markup).toContain("product-demo-readiness-checker");
    expect(markup).toContain("ClipStitchr is a paid product");
    expect(markup).toContain('href="/tools/9-16-app-demo-video-checker"');
    expect(markup).toContain('href="/tools/app-ugc-clip-readiness-checker"');
    expect(markup).toContain('href="/tools"');
    expect(markup).not.toContain("free trial");
  });

  it("renders a useful readiness result and paid plan CTA", () => {
    const answers: ProductDemoAnswers = {
      "action-and-result": "yes",
      "clear-next-step": "yes",
      "dead-time-removed": "yes",
      "one-outcome": "yes",
      "phone-readable": "yes",
      "private-data-hidden": "yes",
      "spoken-words-captioned": "yes",
      "useful-moment": "yes",
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
      <ProductDemoReadinessResults
        answers={answers}
        file={new File(["video"], "demo.mp4", { type: "video/mp4" })}
        inspection={inspection}
        use="short-form-ad"
      />,
    );

    expect(markup).toContain("100%");
    expect(markup).toContain("Ready to test");
    expect(markup).toContain("Three fixes to make next");
    expect(markup).toContain("What already works");
    expect(markup).toContain("Full readiness checklist");
    expect(markup).toContain("See ClipStitchr plans");
    expect(markup).toContain('href="/pricing"');
    expect(markup).not.toContain("Download");
    expect(markup).not.toContain("Start free");
  });

  it("publishes canonical metadata for the checker route", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/product-demo-readiness-checker",
    );
    expect(metadata.openGraph).toMatchObject({
      title: "Product Demo Readiness Checker | ClipStitchr",
    });
  });
});
