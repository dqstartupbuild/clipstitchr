import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HookLabPostAnalysisDialog } from "./HookLabPostAnalysisDialog";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: true }),
  useMutation: () => vi.fn(),
  useQuery: () => null,
}));

vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => ({
    activeProduct: { id: "product_1", name: "Guppy Calisthenics" },
    lockedProductIds: [],
  }),
}));

const post: HookLabPost = {
  analysis: {
    callToAction: "Save the post for later.",
    caption: "A quick morning workflow",
    contentSummary: "A creator demonstrates a quick morning workflow.",
    culturalContext:
      "This likely uses the familiar untouched-coffee cue to imply a rushed morning.",
    format: "Talking head followed by a screen demonstration.",
    formatDna: {
      adObviousness: "The product appears after the opening problem.",
      confidence: "The structure is observed and its effect is inferred.",
      ctaStyle: "Save",
      doNotCopy: ["The creator's exact wording."],
      editRhythm: "A visual change every two seconds.",
      firstPayoff: "The phone screen starts showing the faster workflow.",
      firstPayoffAtSeconds: 2.4,
      hookPattern: "Problem before solution",
      inferences: ["The screen reveal may hold attention."],
      observedEvidence: ["The first frame shows the creator and a phone."],
      openingQuestion: "How is the manual work avoided?",
      openingVisual: "The creator holds a phone beside a task list.",
      productFirstAppearsAtSeconds: 3,
      productRole: "helper",
      proofDevice: "screen recording",
      replicationFormula: "Name the task, show the workflow, reveal the result.",
      retentionDevice: "Delayed screen reveal",
      signatureDevice: "The phone screen reveal",
      soundOffSummary: "The opening overlay names the manual task.",
      storyBeats: ["Problem", "Workflow", "Result"],
      storyFramework: "Problem, demonstration, payoff",
      version: "format-dna-v1",
    },
    onScreenText: ["Stop doing this manually", "Three quick steps"],
    openingHook: "The creator opens with a direct problem statement.",
    likelySubtext:
      "The untouched coffee likely implies that the task has taken over the morning.",
    performance: {
      confidence: "Medium because only public engagement counts are available.",
      engagementExplanation:
        "The visible likes and shares suggest the problem felt useful.",
      hookScore: 82,
      limitations: ["Private watch-time data is unavailable."],
      overallScore: 78,
      pacingScore: 74,
      platformFitScore: 80,
      retentionExplanation:
        "The visual changes are likely to hold attention through the demo.",
      strengths: ["The opening is immediately specific."],
    },
    timeline: [
      {
        actionsAndReactions:
          "The creator points to the list, pauses, then looks back at the camera.",
        audio: "The creator states the problem.",
        editingAndSound: "One hard cut lands after the pause.",
        endSeconds: 3,
        facialExpressionAndBodyLanguage:
          "Brows raised before the point, then a flat stare after it.",
        objectsAndPlacement:
          "A task list sits left of an untouched coffee mug.",
        onScreenText: "Stop doing this manually",
        recreationEssentials:
          "Keep the pause, flat stare, and untouched mug beside the list.",
        startSeconds: 0,
        visual: "The creator speaks directly to camera.",
      },
      {
        audio: "The creator explains the result.",
        endSeconds: 8,
        startSeconds: 3,
        visual: "A phone screen shows the workflow.",
      },
    ],
    recreationEssentials: [
      "Keep the untouched coffee beside the task list through the opening pause.",
    ],
    transferableLessons: ["Show the problem before the walkthrough."],
  },
  analyzedAt: "2026-07-19T12:00:00.000Z",
  authorUsername: "creator",
  canonicalUrl: "https://www.tiktok.com/@creator/video/123",
  createdAt: "2026-07-19T11:59:00.000Z",
  durationSeconds: 8,
  id: "post_123",
  metrics: {
    commentCount: 42,
    likeCount: 1200,
    playCount: 18000,
    shareCount: 96,
  },
  platform: "tiktok",
  sourceText: "A quick morning workflow",
  status: "ready",
  updatedAt: "2026-07-19T12:00:00.000Z",
};

describe("HookLabPostAnalysisDialog", () => {
  it("renders the quick read before the dense analysis", () => {
    const markup = renderToStaticMarkup(
      <HookLabPostAnalysisDialog
        isReanalyzing={false}
        post={post}
        reanalyzeError={null}
        onClose={() => undefined}
        onReanalyze={() => undefined}
      />,
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain("dashboard-dialog-viewport");
    expect(markup).toContain("border-b border-border");
    expect(markup).toContain("bg-white shadow-lg");
    expect(markup).not.toContain("--text-primary");
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain("Quick read");
    expect(markup).toContain("Full breakdown");
    expect(markup).toContain("Your script");
    expect(markup).toContain("What happens");
    expect(markup).toContain("The hook at a glance");
    expect(markup).toContain("The format recipe");
    expect(markup).toContain("What to keep and what to change");
    expect(markup).toContain("A creator demonstrates a quick morning workflow");
    expect(markup).not.toContain("Hooks with a similar job");
    expect(markup).toContain("Use this format");
    expect(markup).toContain("Re-analyze");
    expect(markup).toContain("Re-analysis uses 1 creation credit.");
    expect(markup).toContain(
      "Create an original Guppy Calisthenics ad from this format",
    );
    expect(markup).not.toContain("Expression and body language");
    expect(markup).not.toContain("Private watch-time data is unavailable.");
  });

  it("does not render before analysis is ready", () => {
    const markup = renderToStaticMarkup(
      <HookLabPostAnalysisDialog
        isReanalyzing={false}
        post={{ ...post, analysis: undefined, status: "analyzing" }}
        reanalyzeError={null}
        onClose={() => undefined}
        onReanalyze={() => undefined}
      />,
    );

    expect(markup).toBe("");
  });

  it("keeps re-analysis errors visible in the open report", () => {
    const markup = renderToStaticMarkup(
      <HookLabPostAnalysisDialog
        isReanalyzing={false}
        post={post}
        reanalyzeError="Unable to re-analyze that post."
        onClose={() => undefined}
        onReanalyze={() => undefined}
      />,
    );

    expect(markup).toContain("Unable to re-analyze that post.");
    expect(markup).toContain('aria-describedby="hook-lab-reanalyze-cost"');
  });
});
