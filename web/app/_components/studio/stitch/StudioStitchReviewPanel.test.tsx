import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { StudioStitchGenerationRun } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchGenerationRun";
import type { StudioStitchOutput } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchOutput";
import type { StudioStitchReviewSubset } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchReviewSubset";
import { StudioStitchReviewPanel } from "./StudioStitchReviewPanel";

const completedRun = {
  kind: "sample",
  status: "completed",
  reviewSubsetId: "review_1",
} as StudioStitchGenerationRun;

const pendingReview = {
  id: "review_1",
  status: "pending",
  revision: 1,
  selectedRecipeIds: ["recipe_1"],
  remainingRecipeIds: ["recipe_2", "recipe_3"],
} as StudioStitchReviewSubset;

const acceptedOutput = {
  id: "output_1",
  recipeId: "recipe_1",
  status: "accepted",
} as StudioStitchOutput;

describe("StudioStitchReviewPanel", () => {
  it("enables approval only after every sample recipe has an accepted output", () => {
    const ready = renderToStaticMarkup(
      <StudioStitchReviewPanel
        error={null}
        isApproving={false}
        isCreatingRemaining={false}
        onApprove={vi.fn()}
        onCreateRemaining={vi.fn()}
        outputs={[acceptedOutput]}
        reviewSubset={pendingReview}
        run={completedRun}
      />,
    );
    const waiting = renderToStaticMarkup(
      <StudioStitchReviewPanel
        error={null}
        isApproving={false}
        isCreatingRemaining={false}
        onApprove={vi.fn()}
        onCreateRemaining={vi.fn()}
        outputs={[]}
        reviewSubset={pendingReview}
        run={completedRun}
      />,
    );

    expect(ready).toContain("Every sample recipe has one accepted output.");
    expect(ready).toContain("<button type=\"button\">Approve sample subset</button>");
    expect(waiting).toContain("Accept one output for every sample recipe");
    expect(waiting).toContain("disabled=\"\"");
  });

  it("reveals the remaining-batch intent only after approval", () => {
    const markup = renderToStaticMarkup(
      <StudioStitchReviewPanel
        error={null}
        isApproving={false}
        isCreatingRemaining={false}
        onApprove={vi.fn()}
        onCreateRemaining={vi.fn()}
        outputs={[acceptedOutput]}
        reviewSubset={{
          ...pendingReview,
          status: "approved",
        } as StudioStitchReviewSubset}
        run={completedRun}
      />,
    );

    expect(markup).toContain("The sample is approved.");
    expect(markup).toContain("Create remaining intent (2)");
  });
});
