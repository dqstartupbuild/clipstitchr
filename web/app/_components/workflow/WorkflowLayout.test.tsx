import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkflowLayout } from "@/app/_components/workflow/WorkflowLayout";

describe("WorkflowLayout", () => {
  it("uses a single-column grid when no aside is present", () => {
    const markup = renderToStaticMarkup(
      <WorkflowLayout>
        <div>Main</div>
      </WorkflowLayout>,
    );

    expect(markup).toContain("xl:grid-cols-1");
    expect(markup).not.toContain("xl:grid-cols-[minmax(0,1fr)_340px]");
  });

  it("uses the preview grid when an aside is present", () => {
    const markup = renderToStaticMarkup(
      <WorkflowLayout aside={<aside>Preview</aside>}>
        <div>Main</div>
      </WorkflowLayout>,
    );

    expect(markup).toContain("xl:grid-cols-[minmax(0,1fr)_340px]");
    expect(markup).not.toContain("xl:grid-cols-1");
  });

  it("uses bounded editor grid classes in editor mode", () => {
    const markup = renderToStaticMarkup(
      <WorkflowLayout
        aside={<aside>Preview</aside>}
        contentClassName="custom-content"
        variant="editor"
      >
        <div>Main</div>
      </WorkflowLayout>,
    );

    expect(markup).toContain("overflow-hidden");
    expect(markup).toContain("lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]");
    expect(markup).toContain("grid-rows-[minmax(0,1fr)_minmax(180px,38dvh)]");
    expect(markup).toContain("lg:grid-rows-1");
    expect(markup).toContain("overflow-y-auto");
    expect(markup).toContain("custom-content");
  });
});
