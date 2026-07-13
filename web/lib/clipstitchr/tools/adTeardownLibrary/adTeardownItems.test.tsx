import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CollectionResourcePage } from "@/app/_components/tools/resources/CollectionResourcePage";
import { adTeardownItems } from "@/lib/clipstitchr/tools/adTeardownLibrary/adTeardownItems";
import { adTeardownLibraryDefinition } from "@/lib/clipstitchr/tools/adTeardownLibrary/adTeardownLibraryDefinition";

describe("adTeardownItems", () => {
  it("contains twelve original, limited, source-labeled teaching records", () => {
    expect(adTeardownItems).toHaveLength(12);
    expect(new Set(adTeardownItems.map((item) => item.id))).toHaveLength(12);

    for (const item of adTeardownItems) {
      expect(item.body).toContain("Limitation:");
      expect(item.copyText).toContain("Hook:");
      expect(item.copyText).toContain("Opening visual:");
      expect(item.copyText).toContain("Demo handoff:");
      expect(item.copyText).toContain("Proof:");
      expect(item.copyText).toContain("CTA:");
      expect(item.copyText).toContain("no real ad or performance claim");
    }
  });

  it("renders immediate teardowns, the exact lead source, and paid plans", () => {
    const markup = renderToStaticMarkup(
      <CollectionResourcePage definition={adTeardownLibraryDefinition} />,
    );

    expect(markup).toContain("The weekly reset");
    expect(markup).toContain("Showing 12 of 12");
    expect(markup).toContain('id="app-ad-teardown-library-lead-heading"');
    expect(markup).toContain('href="/pricing"');
  });
});
