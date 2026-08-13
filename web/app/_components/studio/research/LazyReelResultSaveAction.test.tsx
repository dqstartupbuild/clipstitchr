// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LazyReelResultSaveAction } from "./LazyReelResultSaveAction";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mocks = vi.hoisted(() => ({
  saveBrief: vi.fn(),
  saveReport: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    studioLazyReelCreativeBriefs: { save: { save: "brief.save" } },
    studioLazyReelSavedReports: { save: { save: "report.save" } },
  },
}));

vi.mock("convex/react", () => ({
  useMutation: (reference: string) =>
    reference === "brief.save" ? mocks.saveBrief : mocks.saveReport,
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: () => "saved_1",
}));

describe("LazyReelResultSaveAction", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.saveBrief.mockResolvedValue({});
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
  });

  it("saves Make a brief output as a Product-scoped creative brief", async () => {
    await act(async () => {
      root.render(
        <LazyReelResultSaveAction
          completedJob={{
            kind: "tool",
            runId: "run_1",
            result: {
              tool: "make_brief",
              title: "Grounded brief",
              summary: "A Product-grounded direction.",
              data: {},
              evidence: [],
              limitations: [],
              links: [],
              methodology: "Saved facts plus corpus structure.",
              sections: [],
            },
          }}
          productId="product_1"
          snapshotVersion="lazyreel-v1"
        />,
      );
    });

    const button = container.querySelector("button");
    await act(async () => button?.click());

    expect(mocks.saveBrief).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "saved_1",
        productId: "product_1",
        researchRunId: "run_1",
        identity: { kind: "tool", key: "make_brief" },
        sourceSnapshotVersion: "lazyreel-v1",
      }),
    );
    expect(mocks.saveReport).not.toHaveBeenCalled();
    expect(button?.textContent).toBe("Brief saved");
  });
});
