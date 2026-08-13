// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioClipsTaskDetailView } from "./StudioClipsTaskDetailView";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@/lib/clipstitchr/hooks/studioClips/useStudioClipsTaskActions", () => ({
  useStudioClipsTaskActions: () => ({
    busyAction: null,
    error: null,
    updateTask: vi.fn(),
  }),
}));

describe("StudioClipsTaskDetailView", () => {
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

  it("states clearly that a provider-unavailable task did not render", async () => {
    await act(async () => {
      root.render(
        <StudioClipsTaskDetailView
          capabilities={{
            schemaVersion: "studio-clips-capabilities-v1",
            sourceSnapshotVersion: "supoclip-v0_1_0",
            productId: "product_1",
            analysis: { message: "Transcript analysis is not connected.", state: "unavailable" },
            execution: { state: "unavailable", reasonCode: "worker_adapter_not_configured", message: "Worker adapter is not configured." },
            sources: {
              youtube: { state: "available" },
              upload: { state: "available", uploadEndpoint: "/api/studio/r2/upload-url" },
            },
            captionStyle: {
              builtInFonts: [],
              customFontUpload: { message: "Not connected", state: "unavailable" },
              execution: "metadata_only",
              fontSizeOptionsPx: [32],
              templates: [],
            },
            outputFormats: [],
            outputMetadata: { message: "Output metadata is not connected.", state: "unavailable" },
            platformExports: [
              { id: "instagram_reels", label: "Instagram Reels", state: "available" },
              { id: "tiktok", label: "TikTok", state: "available" },
              { id: "youtube_shorts", label: "YouTube Shorts", state: "available" },
            ],
            handoffs: {
              library: { state: "available", message: "Connected" },
              editor: { state: "available", message: "Connected" },
              stitchr: { state: "available", message: "Connected" },
            },
            limitations: [],
          }}
          hasActiveProductWork={false}
          onArchived={vi.fn()}
          onUpdated={vi.fn()}
          productId="product_1"
          task={{
            attempt: 0,
            cancelRequested: false,
            checkpoint: "claim_validated",
            createdAt: "2026-08-12T10:00:00.000Z",
            events: [],
            execution: { state: "unavailable", reasonCode: "worker_adapter_not_configured", message: "Worker adapter is not configured." },
            id: "task_1",
            options: { addSubtitles: true, includeBroll: false, outputFormat: "vertical" },
            outputCount: 0,
            outputs: [],
            productId: "product_1",
            progressPercent: 0,
            recordVersion: 1,
            renderRevisions: [],
            revision: 1,
            source: { kind: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
            sourceKind: "youtube",
            status: "provider_unavailable",
            updatedAt: "2026-08-12T10:00:00.000Z",
          }}
        />,
      );
    });

    expect(container.textContent).toContain("No render was started");
    expect(container.textContent).toContain(
      "This saved task did not reach processing",
    );
    expect(container.textContent).toContain("Resume task");
    expect(container.textContent).toContain("Resume is unavailable");
    expect(
      [...container.querySelectorAll("button")].find((button) =>
        button.textContent?.includes("Resume task"),
      )?.disabled,
    ).toBe(true);
    expect(container.textContent).toContain("No finished clip file exists");
  });
});
