import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { StudioStitchGenerationRun } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchGenerationRun";
import { StudioStitchRunActions } from "./StudioStitchRunActions";

function runWithStatus(
  status: StudioStitchGenerationRun["status"],
): StudioStitchGenerationRun {
  return { status, failureRetryable: true } as StudioStitchGenerationRun;
}

describe("StudioStitchRunActions", () => {
  it("keeps a waiting run cancelable and states that processing has not started", () => {
    const markup = renderToStaticMarkup(
      <StudioStitchRunActions
        busyAction={null}
        error={null}
        onAction={vi.fn()}
        run={runWithStatus("intentReady")}
      />,
    );

    expect(markup).toContain("Cancel run");
    expect(markup).toContain("waiting for processing to begin");
    expect(markup).not.toContain("Resume run");
  });

  it("offers resume for canceled work and retry for retryable failure", () => {
    const canceled = renderToStaticMarkup(
      <StudioStitchRunActions
        busyAction={null}
        error={null}
        onAction={vi.fn()}
        run={runWithStatus("canceled")}
      />,
    );
    const failed = renderToStaticMarkup(
      <StudioStitchRunActions
        busyAction={null}
        error={null}
        onAction={vi.fn()}
        run={runWithStatus("failed")}
      />,
    );

    expect(canceled).toContain("Resume run");
    expect(failed).toContain("Retry processing");
  });

  it("reports a claimed run as processing", () => {
    const run = {
      ...runWithStatus("intentReady"),
      startedAt: "2026-08-12T12:00:00.000Z",
    } as StudioStitchGenerationRun;
    const markup = renderToStaticMarkup(
      <StudioStitchRunActions
        busyAction={null}
        error={null}
        onAction={vi.fn()}
        run={run}
      />,
    );

    expect(markup).toContain("Processing has started");
    expect(markup).not.toContain("Execution is not wired");
  });
});
