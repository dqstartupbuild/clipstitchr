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
});
