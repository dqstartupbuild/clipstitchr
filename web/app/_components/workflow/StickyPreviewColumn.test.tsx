import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StickyPreviewColumn } from "@/app/_components/workflow/StickyPreviewColumn";

describe("StickyPreviewColumn", () => {
  it("keeps the sticky preview column by default", () => {
    const markup = renderToStaticMarkup(
      <StickyPreviewColumn>
        <div>Preview</div>
      </StickyPreviewColumn>,
    );

    expect(markup).toContain("xl:sticky");
    expect(markup).toContain("max-w-[340px]");
  });

  it("uses an internal-scroll editor rail when requested", () => {
    const markup = renderToStaticMarkup(
      <StickyPreviewColumn variant="editor">
        <div>Preview</div>
      </StickyPreviewColumn>,
    );

    expect(markup).toContain("overflow-y-auto");
    expect(markup).toContain("lg:border-l");
    expect(markup).not.toContain("xl:sticky");
  });
});
