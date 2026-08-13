// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import { StudioEditorBriefHandoff } from "./StudioEditorBriefHandoff";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mocks = vi.hoisted(() => ({
  brief: null as Record<string, unknown> | null | undefined,
  create: vi.fn(),
  sourceCatalog: {
    catalog: {
      stitches: [] as StudioEditorMediaSourceDescriptor[],
      videoClips: [] as StudioEditorMediaSourceDescriptor[],
    },
    error: null as string | null,
    isLoading: false,
    reload: vi.fn(),
  },
}));

vi.mock("convex/react", () => ({
  useMutation: () => mocks.create,
  useQuery: () => mocks.brief,
}));

vi.mock("@/lib/clipstitchr/hooks/studioEditor/useStudioEditorSourceCatalog", () => ({
  useStudioEditorSourceCatalog: () => mocks.sourceCatalog,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: () => "project_1",
}));

const result = JSON.stringify({
  data: {},
  evidence: [],
  limitations: [],
  links: [],
  methodology: "Product facts and the saved Research corpus.",
  sections: [{ id: "proof", items: ["Show the real result."], title: "Proof" }],
  summary: "Open on the Product problem, then show the result.",
  title: "Proof-led edit",
  tool: "make_brief",
});

describe("StudioEditorBriefHandoff", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.brief = {
      approvalState: "approved",
      briefSnapshot: { payloadJson: result, schemaVersion: "lazyreel-result-v1" },
      handoffDestination: "studio_edit",
      id: "brief_1",
      status: "active",
      title: "Proof-led edit",
    };
    mocks.sourceCatalog.catalog.videoClips = [
      {
        durationSeconds: 15,
        hasAudio: true,
        height: 1920,
        id: "clip_1",
        kind: "videoClip",
        name: "Product demo",
        objectKey: "products/product_1/demo.mp4",
        width: 1080,
      },
    ];
    mocks.sourceCatalog.catalog.stitches = [];
    mocks.sourceCatalog.error = null;
    mocks.sourceCatalog.isLoading = false;
    mocks.create.mockResolvedValue({});
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
  });

  it("shows the complete approved brief and creates a Product edit from a chosen source", async () => {
    const onOpen = vi.fn();
    await act(async () => {
      root.render(
        <StudioEditorBriefHandoff
          briefId="brief_1"
          onCancel={vi.fn()}
          onOpen={onOpen}
          productId="product_1"
        />,
      );
    });

    expect(container.textContent).toContain("Open on the Product problem");
    expect(container.textContent).toContain("Show the real result");
    const select = container.querySelector("select");
    await act(async () => {
      if (!select) return;
      select.focus();
      select.value = "videoClip:clip_1";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(document.activeElement).toBe(select);

    const createButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Create edit from brief",
    );
    await act(async () => createButton?.click());

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "brief-project_1",
        name: "Proof-led edit",
        productId: "product_1",
      }),
    );
    expect(onOpen).toHaveBeenCalledWith("brief-project_1");
  });

  it("does not expose a foreign or unapproved brief", async () => {
    mocks.brief = null;
    await act(async () => {
      root.render(
        <StudioEditorBriefHandoff
          briefId="brief_foreign"
          onCancel={vi.fn()}
          onOpen={vi.fn()}
          productId="product_1"
        />,
      );
    });

    expect(container.textContent).toContain("Brief handoff not found");
    expect(container.querySelector("select")).toBeNull();
  });
});
