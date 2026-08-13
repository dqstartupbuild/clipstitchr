import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { StudioStitchReadinessPanel } from "./StudioStitchReadinessPanel";

describe("StudioStitchReadinessPanel", () => {
  it("reports configured and unavailable provider boundaries honestly", () => {
    const markup = renderToStaticMarkup(
      <StudioStitchReadinessPanel
        error={null}
        onRetry={vi.fn()}
        readiness={{
          execution: "notStarted",
          state: "unavailable",
          providers: [
            {
              capability: "reactionFootage",
              provider: "dansugc",
              state: "configured",
              reason: null,
            },
            {
              capability: "mediaRendering",
              provider: "render",
              state: "unavailable",
              reason: "Rendering is not configured.",
            },
          ],
        }}
      />,
    );

    expect(markup).toContain("Ready when you create a run");
    expect(markup).toContain("Unavailable in this environment");
    expect(markup).toContain("Opening this page does not start work");
    expect(markup).toContain("DansUGC");
    expect(markup).not.toContain("Rendering is not configured.");
    expect(markup).not.toContain("Generation started");
  });
});
