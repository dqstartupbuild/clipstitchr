import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HookLabPostAnalysisDialog } from "./HookLabPostAnalysisDialog";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";

const post: HookLabPost = {
  analysis: {
    callToAction: "Save the post for later.",
    caption: "A quick morning workflow",
    contentSummary: "A creator demonstrates a quick morning workflow.",
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
        audio: "The creator states the problem.",
        endSeconds: 3,
        onScreenText: "Stop doing this manually",
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
  it("renders the complete saved analysis", () => {
    const markup = renderToStaticMarkup(
      <HookLabPostAnalysisDialog post={post} onClose={() => undefined} />,
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain("dashboard-dialog-viewport");
    expect(markup).toContain("border-b border-border");
    expect(markup).toContain("bg-white shadow-xl");
    expect(markup).toContain("min-h-0 gap-8 overflow-y-auto");
    expect(markup).not.toContain("--text-primary");
    expect(markup).toContain("Platform numbers");
    expect(markup).toContain("Words used in the post");
    expect(markup).toContain("A quick morning workflow");
    expect(markup).toContain("Three quick steps");
    expect(markup).toContain("Why it may have performed this way");
    expect(markup).toContain("The first three seconds");
    expect(markup).toContain("The reusable shape");
    expect(markup).toContain("Hooks with a similar job");
    expect(markup).toContain("Use this format");
    expect(markup).toContain("Full play-by-play");
    expect(markup).toContain("0:00-0:03");
    expect(markup).toContain("Stop doing this manually");
    expect(markup).toContain("Private watch-time data is unavailable.");
    expect(markup).toContain("Show the problem before the walkthrough.");
  });

  it("does not render before analysis is ready", () => {
    const markup = renderToStaticMarkup(
      <HookLabPostAnalysisDialog
        post={{ ...post, analysis: undefined, status: "analyzing" }}
        onClose={() => undefined}
      />,
    );

    expect(markup).toBe("");
  });
});
