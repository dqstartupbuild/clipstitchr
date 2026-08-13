// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioClipsCreateForm } from "./StudioClipsCreateForm";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mocks = vi.hoisted(() => ({
  createTask: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/hooks/studioClips/useCreateStudioClipsTask", () => ({
  useCreateStudioClipsTask: () => ({
    createTask: mocks.createTask,
    error: null,
    isCreating: false,
    statusMessage: null,
  }),
}));

const capabilities = {
  schemaVersion: "studio-clips-capabilities-v1" as const,
  sourceSnapshotVersion: "supoclip-v0_1_0" as const,
  productId: "product_1",
  analysis: { message: "Analysis is not connected.", state: "unavailable" as const },
  execution: { state: "unavailable" as const, reasonCode: "worker_adapter_not_configured" as const, message: "Worker adapter is not configured." },
  sources: {
    youtube: { state: "available" as const },
    upload: { state: "available" as const, uploadEndpoint: "/api/studio/r2/upload-url" as const },
  },
  captionStyle: {
    builtInFonts: [{ displayName: "TikTok Sans", id: "TikTokSans-Regular" }],
    customFontUpload: { message: "Custom font storage is not connected.", state: "unavailable" as const },
    execution: "metadata_only" as const,
    fontSizeOptionsPx: [24, 32, 42],
    templates: [{ description: "Bold word-by-word captions", fontColorHex: "#FFFFFF", fontFamily: "TikTokSans-Regular", fontSizePx: 32, id: "default", name: "Default" }],
  },
  outputFormats: [
    { id: "vertical" as const, label: "Vertical 9:16", state: "available" as const },
    { id: "source" as const, label: "Original framing", state: "available" as const },
  ],
  outputMetadata: { message: "Output metadata is not connected.", state: "unavailable" as const },
  platformExports: [
    { id: "instagram_reels" as const, label: "Instagram Reels", state: "available" as const },
    { id: "tiktok" as const, label: "TikTok", state: "available" as const },
    { id: "youtube_shorts" as const, label: "YouTube Shorts", state: "available" as const },
  ],
  handoffs: {
    library: { state: "available" as const, message: "Library handoff is available." },
    editor: { state: "available" as const, message: "Editor handoff is available." },
    stitchr: { state: "available" as const, message: "Stitch handoff is available." },
  },
  limitations: [],
};

describe("StudioClipsCreateForm", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createTask.mockResolvedValue({ id: "task_1" });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
  });

  it("saves an honest provider-unavailable request with framing and caption intent", async () => {
    await act(async () => {
      root.render(
        <StudioClipsCreateForm
          activeWorkId={null}
          capabilities={capabilities}
          isTaskHistoryLoading={false}
          onCreated={vi.fn()}
          productId="product_1"
        />,
      );
    });

    expect(container.querySelector('button[type="submit"]')?.textContent).toBe("Save task for later");
    expect(container.textContent).toContain("Processing has not started");
    expect(container.textContent).toContain("Custom font storage is not connected");

    await act(async () => {
      container.querySelector("form")?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });

    expect(mocks.createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ outputFormat: "vertical", addSubtitles: true }),
        style: expect.objectContaining({ captionTemplate: "default", fontColor: "#FFFFFF" }),
      }),
    );
  });

  it("blocks a second task while one is active", async () => {
    await act(async () => {
      root.render(
        <StudioClipsCreateForm
          activeWorkId="task_active"
          capabilities={capabilities}
          isTaskHistoryLoading={false}
          onCreated={vi.fn()}
          productId="product_1"
        />,
      );
    });

    expect(container.querySelector('button[type="submit"]')?.hasAttribute("disabled")).toBe(true);
    expect(container.querySelector('[role="status"]')?.textContent).toContain(
      "One clip job is already running",
    );
  });

  it("waits for task history before allowing a create", async () => {
    await act(async () => {
      root.render(
        <StudioClipsCreateForm
          activeWorkId={null}
          capabilities={capabilities}
          isTaskHistoryLoading
          onCreated={vi.fn()}
          productId="product_1"
        />,
      );
    });

    expect(container.querySelector('button[type="submit"]')?.hasAttribute("disabled")).toBe(true);
    expect(container.querySelector('[role="status"]')?.textContent).toContain(
      "Checking whether this Product already has a task in progress",
    );
  });
});
