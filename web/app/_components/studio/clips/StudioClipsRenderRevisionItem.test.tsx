// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioClipsRenderRevisionSummary } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionSummary";
import { StudioClipsRenderRevisionItem } from "./StudioClipsRenderRevisionItem";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mocks = vi.hoisted(() => ({ updateRevision: vi.fn() }));

vi.mock("@/lib/clipstitchr/hooks/studioClips/useStudioClipsRenderRevisionActions", () => ({
  useStudioClipsRenderRevisionActions: () => ({
    busyAction: null,
    error: null,
    updateRevision: mocks.updateRevision,
  }),
}));

function revision(
  status: StudioClipsRenderRevisionSummary["status"],
): StudioClipsRenderRevisionSummary {
  return {
    attempt: 1,
    cancelRequested: false,
    createdAt: "2026-08-12T12:00:00.000Z",
    id: "revision_1",
    operationKind: "regenerate",
    outputIds: [],
    productId: "product_1",
    progressPercent: 35,
    revision: 2,
    sourceOutputId: "output_1",
    status,
    taskId: "task_1",
    updatedAt: "2026-08-12T12:01:00.000Z",
  };
}

describe("StudioClipsRenderRevisionItem", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateRevision.mockResolvedValue(revision("cancelled"));
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
  });

  it("supports keyboard focus and a real cancel action", async () => {
    const activeRevision = revision("processing");
    await act(async () => {
      root.render(
        <StudioClipsRenderRevisionItem
          hasActiveProductWork
          onUpdated={vi.fn()}
          processingAvailable
          productId="product_1"
          revision={activeRevision}
        />,
      );
    });

    const button = container.querySelector<HTMLButtonElement>("button");
    button?.focus();
    expect(document.activeElement).toBe(button);
    await act(async () => button?.click());
    expect(mocks.updateRevision).toHaveBeenCalledWith(activeRevision, "cancel");
  });

  it("disables resume with nearby status while another Product job is active", async () => {
    await act(async () => {
      root.render(
        <StudioClipsRenderRevisionItem
          hasActiveProductWork
          onUpdated={vi.fn()}
          processingAvailable
          productId="product_1"
          revision={revision("cancelled")}
        />,
      );
    });

    const button = container.querySelector<HTMLButtonElement>("button");
    expect(button?.disabled).toBe(true);
    expect(container.querySelector('[role="status"]')?.textContent).toContain(
      "Finish the active clip job",
    );
  });
});
