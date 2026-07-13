import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TikTokSafeZonePage } from "@/app/_components/tools/tiktok-safe-zone/TikTokSafeZonePage";

describe("TikTokSafeZonePage", () => {
  it("offers a local, versioned placement preview without claiming certification", () => {
    const markup = renderToStaticMarkup(<TikTokSafeZonePage />);

    expect(markup).toContain("TikTok Safe-Zone Overlay");
    expect(markup).toContain("version 2026.07");
    expect(markup).toContain("not TikTok certification");
    expect(markup).toContain("temporary browser object URL");
    expect(markup).toContain('id="tiktok-safe-zone-overlay-lead-heading"');
    expect(markup).toContain('href="/pricing"');
  });
});
