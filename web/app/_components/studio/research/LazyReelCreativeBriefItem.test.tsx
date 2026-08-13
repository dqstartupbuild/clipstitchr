// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@/convex/_generated/dataModel";
import { LazyReelCreativeBriefItem } from "./LazyReelCreativeBriefItem";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const briefResult = JSON.stringify({
  data: {},
  evidence: [],
  limitations: ["Validate the first cut with viewers."],
  links: [],
  methodology: "Product facts and the saved Research corpus.",
  sections: [{ id: "hook", items: ["Open on the product problem."], title: "Hook" }],
  summary: "Lead with the Product problem, then show proof.",
  title: "Product proof direction",
  tool: "make_brief",
});

function createBrief(
  handoffDestination?: "studio_edit" | "studio_stitch",
) {
  return {
    _creationTime: 1,
    _id: "convex_brief_1" as Id<"studioLazyReelCreativeBriefs">,
    approvalState: "approved" as const,
    approvalUpdatedAt: "2026-08-12T10:00:00.000Z",
    approvedAt: "2026-08-12T10:00:00.000Z",
    briefSnapshot: {
      byteLength: briefResult.length,
      payloadJson: briefResult,
      schemaVersion: "lazyreel-result-v1",
    },
    createdAt: "2026-08-12T10:00:00.000Z",
    handoffDestination,
    id: "brief_1",
    identity: { key: "make_brief" as const, kind: "tool" as const },
    ownerId: "owner_1",
    productId: "product_1",
    recordVersion: 1,
    sourceSnapshotVersion: "lazyreel-v1",
    status: "active" as const,
    title: "Product proof direction",
    updatedAt: "2026-08-12T10:00:00.000Z",
  };
}

describe("LazyReelCreativeBriefItem", () => {
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
    vi.clearAllMocks();
  });

  it("opens a saved Stitch handoff with the approved brief preselected", async () => {
    await act(async () => {
      root.render(
        <LazyReelCreativeBriefItem
          brief={createBrief("studio_stitch")}
          busyAction={null}
          onApprovalChange={vi.fn()}
          onArchive={vi.fn()}
          onHandoffChange={vi.fn()}
        />,
      );
    });

    const openLink = container.querySelector<HTMLAnchorElement>(
      'a[href="/dashboard/studio/stitch?briefId=brief_1"]',
    );
    expect(openLink?.textContent).toContain("Open in Studio Stitch");
    openLink?.focus();
    expect(document.activeElement).toBe(openLink);
    expect(container.textContent).not.toContain("later beta phases");
  });

  it("saves an editor destination with the nearby native controls", async () => {
    const onHandoffChange = vi.fn();
    await act(async () => {
      root.render(
        <LazyReelCreativeBriefItem
          brief={createBrief()}
          busyAction={null}
          onApprovalChange={vi.fn()}
          onArchive={vi.fn()}
          onHandoffChange={onHandoffChange}
        />,
      );
    });

    const select = container.querySelector("select");
    await act(async () => {
      if (!select) return;
      select.focus();
      select.value = "studio_edit";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(document.activeElement).toBe(select);

    const saveButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Save destination",
    );
    await act(async () => saveButton?.click());

    expect(onHandoffChange).toHaveBeenCalledWith("brief_1", "studio_edit");
  });

  it("opens a saved editor handoff with the brief identifier", async () => {
    await act(async () => {
      root.render(
        <LazyReelCreativeBriefItem
          brief={createBrief("studio_edit")}
          busyAction={null}
          onApprovalChange={vi.fn()}
          onArchive={vi.fn()}
          onHandoffChange={vi.fn()}
        />,
      );
    });

    expect(
      container.querySelector(
        'a[href="/dashboard/studio/edit?briefId=brief_1"]',
      ),
    ).not.toBeNull();
  });
});
