import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppCategoryHookPacksRoutePage, {
  metadata,
} from "@/app/(content)/tools/app-category-hook-packs/page";

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

describe("AppCategoryHookPacksRoutePage", () => {
  it("renders six complete packs and category-specific claim reminders", () => {
    const markup = renderToStaticMarkup(<AppCategoryHookPacksRoutePage />);

    expect(markup).toContain("App Category Hook Packs");
    expect(markup).toContain("Showing 60 of 60");
    expect(markup).toContain("The repeatable starting point");
    expect(markup).toContain("The honest utility boundary");
    expect(markup).toContain("Fitness pack");
    expect(markup).toContain("Finance pack");
    expect(markup).toContain("Productivity pack");
    expect(markup).toContain("Dating pack");
    expect(markup).toContain("Education pack");
    expect(markup).toContain("Utility pack");
    expect(markup).toContain("Category reminder:");
    expect(markup).toContain("Mailing list source: app-category-hook-packs");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain('href="/tools/app-ad-hook-structures"');
    expect(markup).toContain("intentionally finite");
    expect(markup).not.toContain("free trial");
  });

  it("publishes focused canonical metadata", () => {
    expect(metadata.alternates?.canonical).toBe(
      "http://localhost:3000/tools/app-category-hook-packs",
    );
    expect(metadata.keywords).toContain("app category hooks");
  });
});
