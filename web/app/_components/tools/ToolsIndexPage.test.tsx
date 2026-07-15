import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ToolsIndexPage } from "@/app/_components/tools/ToolsIndexPage";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";

describe("ToolsIndexPage", () => {
  it("links founders to all fifty public tools and paid plans", () => {
    const markup = renderToStaticMarkup(<ToolsIndexPage />);

    expect(markup).toContain("Plan. Make. Publish.");
    for (const key of publicToolKeys) {
      const tool = publicToolCatalog[key];

      expect(markup).toContain(tool.name);
      expect(markup).toContain(`href="${tool.pathname}"`);
    }
    expect(markup).toContain("ClipStitchr is paid software");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain("See paid plans");
  });
});
