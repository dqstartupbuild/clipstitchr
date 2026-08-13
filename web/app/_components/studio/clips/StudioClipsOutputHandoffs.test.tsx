// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/types/studioClips/StudioClipsCapabilities";
import type { StudioClipsOutput } from "@/lib/clipstitchr/types/studioClips/StudioClipsOutput";
import { StudioClipsOutputHandoffs } from "./StudioClipsOutputHandoffs";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mocks = vi.hoisted(() => ({
  materialize: vi.fn(),
  push: vi.fn(),
  update: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("@/lib/clipstitchr/hooks/studioClips/useStudioClipsOutputActions", () => ({
  useStudioClipsOutputActions: () => ({
    busyOutputId: null,
    error: null,
    materialize: mocks.materialize,
    statusMessage: null,
    update: mocks.update,
  }),
}));

const capabilities: StudioClipsCapabilities = {
  analysis: { message: "Available after processing", state: "unavailable" },
  captionStyle: {
    builtInFonts: [],
    customFontUpload: { message: "Not connected", state: "unavailable" },
    execution: "metadata_only",
    fontSizeOptionsPx: [32],
    templates: [],
  },
  execution: {
    state: "available",
  },
  handoffs: {
    editor: { message: "Open the saved clip in Edit.", state: "available" },
    library: { message: "Save this clip.", state: "available" },
    stitchr: { message: "Open the saved clip in Stitch.", state: "available" },
  },
  limitations: [],
  outputFormats: [],
  outputMetadata: { message: "Available after processing", state: "unavailable" },
  platformExports: [
    { id: "instagram_reels", label: "Instagram Reels", state: "available" },
    { id: "tiktok", label: "TikTok", state: "available" },
    { id: "youtube_shorts", label: "YouTube Shorts", state: "available" },
  ],
  productId: "product_1",
  schemaVersion: "studio-clips-capabilities-v1",
  sourceSnapshotVersion: "supoclip-v0_1_0",
  sources: {
    upload: {
      state: "available",
      uploadEndpoint: "/api/studio/r2/upload-url",
    },
    youtube: { state: "available" },
  },
};

function createOutput(
  acceptance: "accepted" | "pending" = "accepted",
  libraryClipId?: string,
): StudioClipsOutput {
  return {
    artifactId: "artifact_1",
    contentType: "video/mp4",
    createdAt: "2026-08-12T10:00:00.000Z",
    edit: {
      acceptance: { state: acceptance },
      handoffs: [],
      regenerate: { state: "not_requested" },
      version: 1,
    },
    id: "output_1",
    ...(libraryClipId ? { libraryClipId } : {}),
    objectKey: "users/owner/studio/output.mp4",
    productId: "product_1",
    revision: 1,
    sha256: "a".repeat(64),
    sizeBytes: 100,
    taskId: "task_1",
    updatedAt: "2026-08-12T10:00:00.000Z",
  };
}

describe("StudioClipsOutputHandoffs", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mocks.update.mockResolvedValue(createOutput());
    mocks.materialize.mockResolvedValue({
      created: true,
      libraryClipId: "studio_clips_output_1",
      output: createOutput("accepted", "studio_clips_output_1"),
    });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
    vi.clearAllMocks();
  });

  it("materializes an accepted output and opens its real destination", async () => {
    const output = createOutput();
    await act(async () => {
      root.render(
        <StudioClipsOutputHandoffs
          capabilities={capabilities}
          onUpdated={vi.fn()}
          output={output}
          productId="product_1"
          taskId="task_1"
        />,
      );
    });

    const editorButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Open in Studio editor",
    );
    expect(editorButton?.disabled).toBe(false);
    await act(async () => editorButton?.click());

    expect(mocks.materialize).toHaveBeenCalledWith("task_1", output);
    expect(mocks.push).toHaveBeenCalledWith(
      "/dashboard/studio/edit?sourceId=studio_clips_output_1",
    );
  });

  it("requires approval and exposes the durable Library destination after save", async () => {
    await act(async () => {
      root.render(
        <StudioClipsOutputHandoffs
          capabilities={capabilities}
          onUpdated={vi.fn()}
          output={createOutput("pending")}
          productId="product_1"
          taskId="task_1"
        />,
      );
    });
    expect(
      [...container.querySelectorAll("button")].find(
        (button) => button.textContent === "Add to Product Library",
      )?.disabled,
    ).toBe(true);

    await act(async () => {
      root.render(
        <StudioClipsOutputHandoffs
          capabilities={capabilities}
          onUpdated={vi.fn()}
          output={createOutput("accepted", "studio_clips_output_1")}
          productId="product_1"
          taskId="task_1"
        />,
      );
    });
    const libraryButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Open Product Library",
    );
    expect(libraryButton).toBeTruthy();
    await act(async () => libraryButton?.click());
    expect(mocks.push).toHaveBeenCalledWith("/dashboard/library?tab=ugc");
  });

  it("opens Studio Stitch with the materialized Product clip preselected", async () => {
    await act(async () => {
      root.render(
        <StudioClipsOutputHandoffs
          capabilities={capabilities}
          onUpdated={vi.fn()}
          output={createOutput("accepted", "studio_clips_output_1")}
          productId="product_1"
          taskId="task_1"
        />,
      );
    });

    const stitchButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Send to Studio Stitch",
    );
    stitchButton?.focus();
    expect(document.activeElement).toBe(stitchButton);

    await act(async () => stitchButton?.click());

    expect(mocks.materialize).toHaveBeenCalledWith(
      "task_1",
      expect.objectContaining({ libraryClipId: "studio_clips_output_1" }),
    );
    expect(mocks.push).toHaveBeenCalledWith(
      "/dashboard/studio/stitch?sourceId=studio_clips_output_1",
    );
  });
});
