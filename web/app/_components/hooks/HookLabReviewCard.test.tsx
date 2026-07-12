import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HookLabReviewCard } from "@/app/_components/hooks/HookLabReviewCard";
import type { HookLabReviewOption } from "@/lib/clipstitchr/types/HookLabReviewOption";

const option: HookLabReviewOption = {
  angle: "A quick call-out",
  createdAt: "2026-07-12T12:00:00.000Z",
  hook: "Your old workflow is showing",
  id: "option_1",
  isSelected: false,
  planCreatedAt: "2026-07-12T12:00:00.000Z",
  planId: "plan_1",
  planSource: "manual",
  productId: "product_1",
  productName: "Launch Kit",
  rank: 0,
  reason: "It makes the pain recognizable before the demo starts.",
  reviewState: "needs_review",
  stitchId: "stitch_1",
  updatedAt: "2026-07-12T12:00:00.000Z",
};

describe("HookLabReviewCard", () => {
  it("gives one hook its own Use, Save idea, and Not for me actions", () => {
    const markup = renderToStaticMarkup(
      <HookLabReviewCard
        isSaving={false}
        option={option}
        onMarkNotForMe={vi.fn()}
        onSaveIdea={vi.fn()}
        onUndo={vi.fn()}
        onUse={vi.fn()}
      />,
    );

    expect(markup).toContain("Your old workflow is showing");
    expect(markup).toContain(">Use<");
    expect(markup).toContain("Save idea");
    expect(markup).toContain("Not for me");
    expect(markup).not.toContain("Accept hook");
    expect(markup).not.toContain("Reject hook");
  });

  it("shows Undo only for a rejected hook", () => {
    const markup = renderToStaticMarkup(
      <HookLabReviewCard
        isSaving={false}
        option={{ ...option, reviewState: "not_for_me" }}
        onMarkNotForMe={vi.fn()}
        onSaveIdea={vi.fn()}
        onUndo={vi.fn()}
        onUse={vi.fn()}
      />,
    );

    expect(markup).toContain("Undo");
    expect(markup).not.toContain("Not for me</button>");
  });
});
