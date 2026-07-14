import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ClipNamingSystemRoutePage, {
  metadata,
} from "@/app/(content)/tools/clip-naming-system-generator/page";

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

describe("ClipNamingSystemPage", () => {
  it("renders a sanitized convention, editable order, examples, and paid boundary", async () => {
    const markup = renderToStaticMarkup(await ClipNamingSystemRoutePage());

    expect(markup).toContain("Clip Naming System Generator");
    expect(markup).toContain("Filename order");
    expect(markup).toContain(
      "clipstitchr_summer_launch_ugc_hook_maya_before_and_after_us_2026_07_12_v01.mp4",
    );
    expect(markup).toContain("Token legend");
    expect(markup).toContain("Copy filename");
    expect(markup).toContain("does not rename files");
    expect(markup).toContain(
      "Mailing list source: clip-naming-system-generator",
    );
    expect(markup).toContain('href="/pricing"');
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/clip-naming-system-generator",
    );
  });
});
