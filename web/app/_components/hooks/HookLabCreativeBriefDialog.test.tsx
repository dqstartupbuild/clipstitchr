/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";
import type { HookLibraryTemplateSummary } from "@/lib/clipstitchr/types/HookLibraryTemplateSummary";
import { HookLabCreativeBriefDialog } from "./HookLabCreativeBriefDialog";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mocks = vi.hoisted(() => ({
  approveBrief: vi.fn(),
  createBrief: vi.fn(),
  push: vi.fn(),
  setActiveProduct: vi.fn(),
  updateBrief: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    hookLabCreativeBriefs: {
      approve: { approve: "brief.approve" },
      update: { update: "brief.update" },
    },
  },
}));

vi.mock("convex/react", () => ({
  useMutation: (reference: string) =>
    reference === "brief.approve" ? mocks.approveBrief : mocks.updateBrief,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/lib/clipstitchr/client/createHookLabCreativeBrief", () => ({
  createHookLabCreativeBrief: mocks.createBrief,
}));

vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => ({
    activeProductId: "product_1",
    lockedProductIds: [],
    products: [{ id: "product_1", name: "Launch Kit" }],
    setActiveProduct: mocks.setActiveProduct,
  }),
}));

const post = { id: "post_1" } as HookLabPost;
const template: HookLibraryTemplateSummary = {
  bestFor: ["Product demos"],
  categoryKey: "demonstration",
  categoryName: "Demonstration",
  emotionalTrigger: "Curiosity",
  id: "hook_1",
  purposes: ["clipr"],
  requiredVariables: [],
  riskLevel: "safe",
  template: "Show the result before the explanation",
};
const generatedBrief = {
  brief: {
    beatScript: ["Problem", "Proof"],
    callToAction: "See the workflow.",
    directionName: "Morning reset",
    footageNeeds: ["A real task list"],
    hook: "Your morning disappears here.",
    openingVisual: "A task list beside coffee.",
    productProof: "Show the saved workflow in use.",
    soundOffOverlay: "Where the morning goes",
  },
  createdAt: "2026-07-21T00:00:00.000Z",
  destinationTool: "clipr" as const,
  formatDnaVersion: "format-dna-v1",
  id: "brief_1",
  productId: "product_1",
  sourcePostIds: ["post_1"],
  status: "draft" as const,
  updatedAt: "2026-07-21T00:00:00.000Z",
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.clearAllMocks();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  mocks.createBrief.mockResolvedValue({ brief: generatedBrief });
  mocks.updateBrief.mockResolvedValue(generatedBrief);
  mocks.approveBrief.mockResolvedValue({ ...generatedBrief, status: "approved" });
});

afterEach(() => {
  act(() => root.unmount());
  document.body.replaceChildren();
});

describe("HookLabCreativeBriefDialog", () => {
  it("generates a brief from the selected product, tool, and hook", async () => {
    await act(async () => {
      root.render(
        <HookLabCreativeBriefDialog
          post={post}
          templates={[template]}
          onClose={vi.fn()}
        />,
      );
    });

    const createButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Create brief"),
    );

    await act(async () => {
      createButton?.click();
      await Promise.resolve();
    });

    expect(mocks.createBrief).toHaveBeenCalledWith({
      destinationTool: "clipr",
      hookTemplateId: "hook_1",
      productId: "product_1",
      sourcePostId: "post_1",
    });
    expect(container.textContent).toContain("Review your creative brief");
    expect(container.textContent).toContain("Save and open Clipr");
  });

  it("moves focus into the dialog and restores the opener", async () => {
    const opener = document.createElement("button");
    opener.textContent = "Use this format";
    document.body.prepend(opener);
    opener.focus();
    const onClose = vi.fn(() => root.render(null));

    await act(async () => {
      root.render(
        <HookLabCreativeBriefDialog
          post={post}
          templates={[template]}
          onClose={onClose}
        />,
      );
    });

    expect(document.activeElement?.getAttribute("aria-label")).toBe(
      "Close creative brief",
    );

    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
      );
    });

    expect(onClose).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(opener);
  });
});
