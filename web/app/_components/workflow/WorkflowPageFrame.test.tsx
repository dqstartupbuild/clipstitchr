import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkflowPageFrame } from "@/app/_components/workflow/WorkflowPageFrame";

describe("WorkflowPageFrame", () => {
  it("fills the available workspace without page overflow", () => {
    const markup = renderToStaticMarkup(
      <WorkflowPageFrame className="custom-frame">
        <div>Workspace</div>
      </WorkflowPageFrame>,
    );

    expect(markup).toContain("min-h-0");
    expect(markup).toContain("flex-1");
    expect(markup).toContain("overflow-hidden");
    expect(markup).toContain("custom-frame");
  });
});
