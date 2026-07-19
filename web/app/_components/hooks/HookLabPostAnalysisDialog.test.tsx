import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HookLabPostAnalysisDialog } from "./HookLabPostAnalysisDialog";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";

const post: HookLabPost = {
  analysis: {
    callToAction: "Save the post for later.",
    contentSummary: "A creator demonstrates a quick morning workflow.",
    format: "Talking head followed by a screen demonstration.",
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
    expect(markup).toContain("Platform numbers");
    expect(markup).toContain("Why it may have performed this way");
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
