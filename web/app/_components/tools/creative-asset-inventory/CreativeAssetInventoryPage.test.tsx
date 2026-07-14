import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import CreativeAssetInventoryRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-creative-asset-inventory-template/page";

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

describe("CreativeAssetInventoryPage", () => {
  it("renders six editable asset types, four honest states, priorities, and exports", async () => {
    const markup = renderToStaticMarkup(
      await CreativeAssetInventoryRoutePage(),
    );

    expect(markup).toContain("App Creative Asset Inventory Template");
    expect(markup).toContain("Hooks and opening lines");
    expect(markup).toContain("UGC clips");
    expect(markup).toContain("Product demos");
    expect(markup).toContain("Avatar or presenter clips");
    expect(markup).toContain("Calls to action");
    expect(markup).toContain("Finished ads");
    expect(markup).toContain("Rights unknown");
    expect(markup).toContain("Prioritized captures and fixes");
    expect(markup).toContain("Download CSV");
    expect(markup).toContain("Download Markdown");
    expect(markup).toContain(
      "Mailing list source: app-creative-asset-inventory-template",
    );
    expect(markup).toContain('href="/pricing"');
  });

  it("publishes canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-creative-asset-inventory-template",
    );
  });
});
