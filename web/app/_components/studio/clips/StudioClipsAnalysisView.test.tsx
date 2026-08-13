// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StudioClipsAnalysisView } from "./StudioClipsAnalysisView";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const capabilities = {
  analysis: { message: "Analysis is unavailable until the worker adapter is connected.", state: "unavailable" as const },
  captionStyle: {
    builtInFonts: [],
    customFontUpload: { message: "Not connected", state: "unavailable" as const },
    execution: "metadata_only" as const,
    fontSizeOptionsPx: [32],
    templates: [],
  },
  execution: { state: "unavailable" as const, reasonCode: "worker_adapter_not_configured" as const, message: "Not connected" },
  handoffs: {
    editor: { message: "Connected", state: "available" as const },
    library: { message: "Connected", state: "available" as const },
    stitchr: { message: "Connected", state: "available" as const },
  },
  limitations: [],
  outputFormats: [],
  outputMetadata: { message: "Not connected", state: "unavailable" as const },
  platformExports: [
    { id: "instagram_reels" as const, label: "Instagram Reels", state: "available" as const },
    { id: "tiktok" as const, label: "TikTok", state: "available" as const },
    { id: "youtube_shorts" as const, label: "YouTube Shorts", state: "available" as const },
  ],
  productId: "product_1",
  schemaVersion: "studio-clips-capabilities-v1" as const,
  sources: {
    upload: { state: "available" as const, uploadEndpoint: "/api/studio/r2/upload-url" as const },
    youtube: { state: "available" as const },
  },
  sourceSnapshotVersion: "supoclip-v0_1_0" as const,
};

const baseTask = {
  attempt: 1,
  cancelRequested: false,
  createdAt: "2026-08-12T10:00:00.000Z",
  events: [],
  execution: { state: "available" as const },
  id: "task_1",
  options: { addSubtitles: true, includeBroll: false, outputFormat: "vertical" as const },
  outputCount: 0,
  outputs: [],
  productId: "product_1",
  progressPercent: 100,
  recordVersion: 1 as const,
  renderRevisions: [],
  revision: 3,
  source: { kind: "youtube" as const, url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  sourceKind: "youtube" as const,
  status: "completed" as const,
  updatedAt: "2026-08-12T10:05:00.000Z",
};

describe("StudioClipsAnalysisView", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
  });

  it("renders the complete bounded transcript, scores, and reasoning", async () => {
    await act(async () => {
      root.render(
        <StudioClipsAnalysisView
          capabilities={capabilities}
          task={{
            ...baseTask,
            analysis: {
              schemaVersion: "studio-clips-analysis-v1",
              summary: "Two moments survived the first pass.",
              transcriptExcerpts: [
                { startSeconds: 2, endSeconds: 8, text: "First complete excerpt." },
                { startSeconds: 18, endSeconds: 27, text: "Second complete excerpt." },
              ],
              candidates: [
                {
                  id: "candidate_1",
                  startSeconds: 2,
                  endSeconds: 8,
                  title: "Clear opening",
                  reasoning: ["The claim arrives early.", "The example stays concrete."],
                  score: { overall: 88, hook: 24, clarity: 23, retention: 21, shareability: 20 },
                },
              ],
            },
          }}
        />,
      );
    });

    expect(container.textContent).toContain("First complete excerpt.");
    expect(container.textContent).toContain("Second complete excerpt.");
    expect(container.textContent).toContain("Clear opening");
    expect(container.textContent).toContain("The claim arrives early.");
    expect(container.textContent).toContain("88");
  });

  it("explains why analysis is absent instead of showing an empty result", async () => {
    await act(async () => {
      root.render(<StudioClipsAnalysisView capabilities={capabilities} task={baseTask} />);
    });

    expect(container.textContent).toContain("will appear after clip processing is connected");
  });
});
