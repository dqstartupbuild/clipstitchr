import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ShortFormAuditRoutePage, {
  metadata,
} from "@/app/(content)/tools/personalized-short-form-content-audit/page";

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

describe("ShortFormAuditPage", () => {
  it("renders a transparent five-dimension score and all fourteen plan days", async () => {
    const markup = renderToStaticMarkup(await ShortFormAuditRoutePage());

    expect(markup).toContain("Personalized Short-Form Content Audit");
    expect(markup).toContain("50/100");
    expect(markup).toContain("Message clarity · 20 points");
    expect(markup).toContain("Testing discipline · 20 points");
    expect(markup).toContain("Lost-point priorities");
    expect(markup).toContain("Day 1");
    expect(markup).toContain("Day 14");
    expect(markup).toContain("Download full audit");
    expect(markup).toContain(
      "Mailing list source: personalized-short-form-content-audit",
    );
    expect(markup).toContain('href="/pricing"');
    expect(markup).not.toContain("Connect your account");
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/personalized-short-form-content-audit",
    );
  });
});
