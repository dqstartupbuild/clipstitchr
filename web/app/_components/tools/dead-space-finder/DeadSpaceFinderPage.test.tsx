import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DeadSpaceFinderPage } from "@/app/_components/tools/dead-space-finder/DeadSpaceFinderPage";

describe("DeadSpaceFinderPage", () => {
  it("explains local candidate analysis, uses the exact lead source, and links paid plans", () => {
    const markup = renderToStaticMarkup(<DeadSpaceFinderPage />);

    expect(markup).toContain("App-Ad Dead-Space Finder");
    expect(markup).toContain("Use the timestamps as review prompts, not automatic cuts.");
    expect(markup).toContain('id="app-ad-dead-space-finder-lead-heading"');
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain("never uploaded");
  });
});
