import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ShortFormVideoSpecsPage } from "@/app/_components/tools/short-form-video-specs/ShortFormVideoSpecsPage";

describe("ShortFormVideoSpecsPage", () => {
  it("renders dated, source-linked records and keeps the reference boundary clear", () => {
    const markup = renderToStaticMarkup(<ShortFormVideoSpecsPage />);

    expect(markup).toContain("Short-Form Video Specs Cheat Sheet");
    expect(markup).toContain("Showing 7 of 7 dated records");
    expect(markup).toContain("2026-07-12");
    expect(markup).toContain("Not stated on the linked source page");
    expect(markup).toContain(
      "ads.tiktok.com/help/article/creative-best-practices",
    );
    expect(markup).toContain("support.google.com/google-ads/answer/16041697");
    expect(markup).toContain(
      'id="short-form-video-specs-cheat-sheet-lead-heading"',
    );
    expect(markup).toContain('href="/pricing"');
  });
});
