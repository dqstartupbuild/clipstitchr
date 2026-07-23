/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";
import { HookLabAnalysisWorkspace } from "./HookLabAnalysisWorkspace";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mocks = vi.hoisted(() => ({
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
    activeProduct: { id: "product_1", name: "Guppy Calisthenics" },
    lockedProductIds: [],
  }),
}));

const post = {
  analysis: {
    callToAction: "Comment Guppy.",
    caption: "Reference caption",
    contentSummary: "A performer reacts before revealing a workout app.",
    format: "Reaction followed by demonstration",
    formatDna: {
      adObviousness: "After the opening reaction",
      confidence: "The sequence is visible.",
      ctaStyle: "Comment keyword",
      doNotCopy: ["The creator's exact wording."],
      editRhythm: "A cut every two seconds",
      firstPayoff: "The app appears",
      firstPayoffAtSeconds: 2,
      hookPattern: "Unexpected reaction",
      inferences: ["The pause may create curiosity."],
      observedEvidence: ["The performer looks at the phone."],
      openingQuestion: "Why did the performer react?",
      openingVisual: "The performer freezes beside a phone.",
      productFirstAppearsAtSeconds: 2,
      productRole: "payoff",
      proofDevice: "screen recording",
      replicationFormula: "React, pause, reveal the product.",
      retentionDevice: "Delayed reveal",
      signatureDevice: "The frozen reaction",
      soundOffSummary: "Text sets up the surprise.",
      storyBeats: ["React", "Pause", "Reveal"],
      storyFramework: "Setup and reveal",
      version: "format-dna-v1",
    },
    onScreenText: ["Wait for it"],
    openingHook: "The performer freezes beside a phone.",
    performance: {
      confidence: "Public data only.",
      engagementExplanation: "The premise is clear.",
      hookScore: 80,
      limitations: ["No retention data."],
      overallScore: 80,
      pacingScore: 80,
      platformFitScore: 80,
      retentionExplanation: "The reveal may hold attention.",
      strengths: ["Clear opening."],
    },
    recreationEssentials: ["Keep the pause before the reveal."],
    timeline: [
      {
        endSeconds: 2,
        facialExpressionAndBodyLanguage: "Eyes widen after the pause.",
        startSeconds: 0,
        visual: "The performer freezes beside the phone.",
      },
    ],
    transferableLessons: ["Delay the product reveal."],
  },
  canonicalUrl: "https://www.tiktok.com/@creator/video/1",
  createdAt: "2026-07-22T00:00:00.000Z",
  id: "post_1",
  metrics: {},
  platform: "tiktok",
  status: "ready",
  updatedAt: "2026-07-22T00:00:00.000Z",
} satisfies HookLabPost;

const generatedBrief = {
  brief: {
    adaptedCaption: "Try the Guppy version.",
    adaptedConcept: "The workout reveal",
    beatScript: ["0:00-0:02 | Freeze, then reveal the app."],
    callToAction: "Comment Guppy.",
    closingCta: "Comment Guppy.",
    directionName: "The workout reveal",
    footageNeeds: ["Phone beside performer."],
    hook: "I did not expect that first rep.",
    onScreenTextByScene: ["Scene 1: That first rep"],
    openingReaction: "Freeze, widen eyes, then look at the phone.",
    openingVisual: "Freeze beside the phone.",
    productDemonstration: "Reveal the Guppy workout screen.",
    productProof: "Reveal the Guppy workout screen.",
    propsAndInteractions: ["Pick up the phone after the reaction."],
    sceneBySceneDirections: ["0:00-0:02 | Freeze, then reveal the app."],
    soundOffOverlay: "That first rep",
    spokenLines: ["Scene 1: I did not expect that first rep."],
  },
  createdAt: "2026-07-22T00:00:00.000Z",
  destinationTool: "clipr" as const,
  formatDnaVersion: "format-dna-v1",
  id: "brief_1",
  productId: "product_1",
  sourcePostIds: ["post_1"],
  status: "draft" as const,
  updatedAt: "2026-07-22T00:00:00.000Z",
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.savedAdaptation = null;
  mocks.createBrief.mockResolvedValue({ brief: generatedBrief });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  document.body.replaceChildren();
});

describe("HookLabAnalysisWorkspace", () => {
  it("loads a previously saved script without generating it again", async () => {
    mocks.savedAdaptation = {
      brief: generatedBrief,
      productName: "Guppy Calisthenics",
    };

    await act(async () => {
      root.render(<HookLabAnalysisWorkspace post={post} />);
    });

    expect(container.textContent).toContain("Ready");
    expect(container.textContent).toContain("Open your script");

    const scriptTab = Array.from(container.querySelectorAll('[role="tab"]')).find(
      (tab) => tab.textContent?.includes("Your script"),
    );

    await act(async () => {
      (scriptTab as HTMLButtonElement | undefined)?.click();
    });

    expect(container.textContent).toContain("The workout reveal");
    expect(container.textContent).toContain("Script for Guppy Calisthenics");
    expect(mocks.createBrief).not.toHaveBeenCalled();
  });

  it("separates quick reading, full analysis, and the generated script", async () => {
    await act(async () => {
      root.render(<HookLabAnalysisWorkspace post={post} />);
    });

    expect(container.textContent).toContain("What happens");
    expect(container.textContent).not.toContain("Eyes widen after the pause.");

    const tabs = Array.from(
      container.querySelectorAll('[role="tab"]'),
    );
    const quickReadTab = tabs.find((tab) =>
      tab.textContent?.includes("Quick read"),
    );
    const breakdownTab = tabs.find((tab) =>
      tab.textContent?.includes("Full breakdown"),
    );

    await act(async () => {
      (quickReadTab as HTMLButtonElement | undefined)?.focus();
      quickReadTab?.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }),
      );
    });

    expect(breakdownTab?.getAttribute("aria-selected")).toBe("true");
    expect(container.textContent).toContain("Eyes widen after the pause.");
    expect(container.textContent).not.toContain("Turn this into your product script");

    await act(async () => {
      (quickReadTab as HTMLButtonElement | undefined)?.click();
    });

    const generateButton = Array.from(
      container.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("Use this format"));

    await act(async () => {
      generateButton?.click();
      await Promise.resolve();
    });

    expect(mocks.createBrief).toHaveBeenCalledOnce();
    expect(container.textContent).toContain("Your script");
    expect(container.textContent).toContain("The workout reveal");
    expect(container.textContent).toContain("Ready");
    expect(container.textContent).not.toContain("What happens");
  });
});
