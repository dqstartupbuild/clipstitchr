import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import UgcCreatorHandoffKitRoutePage, {
  metadata,
} from "@/app/(content)/tools/ugc-creator-handoff-kit/page";

vi.mock("@/app/_components/tools/ToolLeadCaptureForm", () => ({
  ToolLeadCaptureForm: ({ source }: { source: string }) => (
    <section>Mailing list source: {source}. ClipStitchr is paid.</section>
  ),
}));

vi.mock(
  "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest",
  () => ({
    resolvePublicToolGateVariantForRequest: vi.fn(async () => "control"),
  }),
);

describe("UgcCreatorHandoffKitPage", () => {
  it("renders every handoff artifact and a paid conversion path", async () => {
    const markup = renderToStaticMarkup(await UgcCreatorHandoffKitRoutePage());

    expect(markup).toContain("UGC Creator Handoff Kit");
    expect(markup).toContain('"@type":"WebApplication"');
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).toContain("Folder layout");
    expect(markup).toContain("Upload manifest");
    expect(markup).toContain("Missing-file note");
    expect(markup).toContain("Reshoot request template");
    expect(markup).toContain("Download Markdown");
    expect(markup).toContain("Mailing list source: ugc-creator-handoff-kit");
    expect(markup).toContain('href="/pricing"');
    expect(markup).not.toContain("Upload footage now");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/ugc-creator-handoff-kit",
    );
  });
});
