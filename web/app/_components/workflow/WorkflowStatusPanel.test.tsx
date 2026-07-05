import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkflowStatusPanel } from "@/app/_components/workflow/WorkflowStatusPanel";

describe("WorkflowStatusPanel", () => {
  it("renders shared workflow status with progress and error details", () => {
    const markup = renderToStaticMarkup(
      <WorkflowStatusPanel
        error="Something stopped."
        eyebrow="Status"
        message="Still working."
        progress={0.42}
        statusLabel="42%"
        title="Creating"
      >
        <span>Extra action</span>
      </WorkflowStatusPanel>,
    );

    expect(markup).toContain("Status");
    expect(markup).toContain("Creating");
    expect(markup).toContain("Still working.");
    expect(markup).toContain("42%");
    expect(markup).toContain("width:42%");
    expect(markup).toContain("Something stopped.");
    expect(markup).toContain("Extra action");
  });
});
