/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";
import { HookLabProductAdaptationSection } from "./HookLabProductAdaptationSection";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mocks = vi.hoisted(() => ({
  activeProduct: { id: "product_guppy", name: "Guppy Calisthenics" },
  clipboardWrite: vi.fn(),
  createBrief: vi.fn(),
  savedAdaptation: null as null | {
    brief: Record<string, unknown>;
    productName: string | null;
  },
  updateBrief: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    hookLabCreativeBriefs: {
      getLatestForSourcePost: { getLatestForSourcePost: "brief.latest" },
      update: { update: "brief.update" },
    },
  },
}));

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: true }),
  useMutation: () => mocks.updateBrief,
  useQuery: () => mocks.savedAdaptation,
}));

vi.mock("@/lib/clipstitchr/client/createHookLabCreativeBrief", () => ({
  createHookLabCreativeBrief: mocks.createBrief,
}));

vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => ({
    activeProduct: mocks.activeProduct,
    lockedProductIds: [],
  }),
}));

const generatedBrief = {
  brief: {
    adaptedCaption: "Built for a stronger first set.",
    adaptedConcept: "The first-set surprise",
    beatScript: ["0:00-0:02 | Look at the bar, then camera."],
    callToAction: "Start your Guppy session.",
    closingCta: "Start your Guppy session.",
    directionName: "The first-set surprise",
    footageNeeds: ["Pull-up bar starts above the performer."],
    hook: "Scene 1: That first rep told on me.",
    onScreenTextByScene: ["Scene 1: When the first rep gets honest"],
    openingReaction: "Look doubtful before the rep, then surprised after it.",
    openingVisual: "Look doubtful before the rep, then surprised after it.",
    productDemonstration: "Show the selected Guppy workout in use.",
    productProof: "Show the selected Guppy workout in use.",
    propsAndInteractions: ["Grip the bar only after looking at camera."],
    sceneBySceneDirections: ["0:00-0:02 | Look at the bar, then camera."],
    soundOffOverlay: "Scene 1: When the first rep gets honest",
    spokenLines: ["Scene 1: That first rep told on me."],
  },
  createdAt: "2026-07-22T00:00:00.000Z",
  destinationTool: "clipr" as const,
  formatDnaVersion: "format-dna-v1",
  id: "brief_1",
  productId: "product_guppy",
  sourcePostIds: ["post_1"],
  status: "draft" as const,
  updatedAt: "2026-07-22T00:00:00.000Z",
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.activeProduct.id = "product_guppy";
  mocks.activeProduct.name = "Guppy Calisthenics";
  mocks.savedAdaptation = null;
  mocks.createBrief.mockResolvedValue({ brief: generatedBrief });
  mocks.updateBrief.mockResolvedValue(generatedBrief);
  Object.assign(navigator, {
    clipboard: { writeText: mocks.clipboardWrite },
  });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  document.body.replaceChildren();
});

describe("HookLabProductAdaptationSection", () => {
  it("uses the global product and keeps generation, editing, and copying in Hook Lab", async () => {
    await act(async () => {
      root.render(
        <HookLabProductAdaptationSection
          post={{ id: "post_1" } as HookLabPost}
        />,
      );
    });

    expect(container.textContent).toContain("Writing for Guppy Calisthenics");
    expect(container.querySelector("select")).toBeNull();

    const useButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Use this format"),
    );

    await act(async () => {
      useButton?.click();
      await Promise.resolve();
    });

    expect(mocks.createBrief).toHaveBeenCalledWith({
      productId: "product_guppy",
      sourcePostId: "post_1",
    });
    expect(container.textContent).toContain("Scene-by-scene directions");
    expect(container.textContent).toContain("Adapted caption");
    expect(container.textContent).not.toContain("Clipr");
    expect(container.textContent).not.toContain("Stitchr");
    expect(container.textContent).not.toContain("Swipr");

    const copyButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Copy script"),
    );
    const editButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Edit script"),
    );

    await act(async () => {
      copyButton?.click();
      await Promise.resolve();
      editButton?.click();
    });

    const saveButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Save edits"),
    );

    await act(async () => {
      saveButton?.click();
      await Promise.resolve();
    });

    expect(mocks.clipboardWrite).toHaveBeenCalledWith(
      expect.stringContaining("ADAPTED CONCEPT"),
    );
    expect(mocks.updateBrief).toHaveBeenCalledOnce();
    expect(mocks.createBrief).toHaveBeenCalledOnce();
  });

  it("regenerates for the newly active global product", async () => {
    await act(async () => {
      root.render(
        <HookLabProductAdaptationSection
          post={{ id: "post_1" } as HookLabPost}
        />,
      );
    });

    await act(async () => {
      container.querySelector("button")?.click();
      await Promise.resolve();
    });

    mocks.activeProduct.id = "product_bloomin";
    mocks.activeProduct.name = "Bloomin";
    mocks.createBrief.mockResolvedValueOnce({
      brief: { ...generatedBrief, productId: "product_bloomin" },
    });

    await act(async () => {
      root.render(
        <HookLabProductAdaptationSection
          post={{ id: "post_1" } as HookLabPost}
        />,
      );
    });

    const regenerateButton = Array.from(
      container.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("Remake for Bloomin"));

    await act(async () => {
      regenerateButton?.click();
      await Promise.resolve();
    });

    expect(mocks.createBrief).toHaveBeenNthCalledWith(2, {
      productId: "product_bloomin",
      sourcePostId: "post_1",
    });
    expect(container.textContent).toContain("Script for Bloomin");
  });
});
