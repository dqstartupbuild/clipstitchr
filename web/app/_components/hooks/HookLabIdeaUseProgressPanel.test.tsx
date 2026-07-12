import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HookLabIdeaUseProgressPanel } from "@/app/_components/hooks/HookLabIdeaUseProgressPanel";

const mocks = vi.hoisted(() => ({
  useHookLabIdeaUse: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/hooks/useHookLabIdeaUse", () => ({
  useHookLabIdeaUse: mocks.useHookLabIdeaUse,
}));

describe("HookLabIdeaUseProgressPanel", () => {
  it("keeps sibling states independent and reveals review after a partial result", () => {
    mocks.useHookLabIdeaUse.mockReturnValue({
      isLoading: false,
      progress: {
        completedVariantCount: 1,
        failedVariantCount: 1,
        id: "use_1",
        progress: 2 / 3,
        status: "generating",
        variationCount: 3,
        variants: [
          {
            finishedStitchId: "stitch_1",
            id: "variant_1",
            status: "completed",
            variantIndex: 0,
          },
          {
            id: "variant_2",
            status: "finalizing",
            variantIndex: 1,
          },
          {
            id: "variant_3",
            status: "failed",
            variantIndex: 2,
          },
        ],
      },
    });

    const markup = renderToStaticMarkup(
      <HookLabIdeaUseProgressPanel useId="use_1" />,
    );

    expect(mocks.useHookLabIdeaUse).toHaveBeenCalledWith("use_1");
    expect(markup).toContain(
      "1 ready, 1 couldn’t finish, and 1 still in progress.",
    );
    expect(markup).toContain("Version 1");
    expect(markup).toContain("Ready to review");
    expect(markup).toContain("Version 2");
    expect(markup).toContain("Putting the Stitch together");
    expect(markup).toContain("Version 3");
    expect(markup).toContain("This version couldn’t finish");
    expect(markup).toContain("Review Stitch");
    expect(markup).toContain('href="/dashboard/library?tab=stitches"');
  });

  it("does not offer review before any sibling completes", () => {
    mocks.useHookLabIdeaUse.mockReturnValue({
      isLoading: false,
      progress: {
        completedVariantCount: 0,
        failedVariantCount: 0,
        id: "use_2",
        progress: 0,
        status: "generating",
        variationCount: 1,
        variants: [
          {
            id: "variant_1",
            status: "creating_opening",
            variantIndex: 0,
          },
        ],
      },
    });

    const markup = renderToStaticMarkup(
      <HookLabIdeaUseProgressPanel useId="use_2" />,
    );

    expect(markup).toContain("Your Stitch is being created.");
    expect(markup).toContain("Creating the opening");
    expect(markup).not.toContain("Review Stitch");
  });

  it("explains a terminal partial result while keeping completed work reviewable", () => {
    mocks.useHookLabIdeaUse.mockReturnValue({
      isLoading: false,
      progress: {
        completedVariantCount: 1,
        failedVariantCount: 2,
        id: "use_3",
        progress: 1,
        status: "partial",
        variationCount: 3,
        variants: [
          {
            finishedStitchId: "stitch_1",
            id: "variant_1",
            status: "completed",
            variantIndex: 0,
          },
          {
            id: "variant_2",
            status: "failed",
            variantIndex: 1,
          },
          {
            id: "variant_3",
            status: "failed",
            variantIndex: 2,
          },
        ],
      },
    });

    const markup = renderToStaticMarkup(
      <HookLabIdeaUseProgressPanel useId="use_3" />,
    );

    expect(markup).toContain(
      "1 of 3 Stitches is ready. 2 couldn’t be finished.",
    );
    expect(markup).toContain("Review Stitch");
  });

  it("explains a fully failed use without showing a dead review action", () => {
    mocks.useHookLabIdeaUse.mockReturnValue({
      isLoading: false,
      progress: {
        completedVariantCount: 0,
        failedVariantCount: 1,
        id: "use_4",
        progress: 1,
        status: "failed",
        variationCount: 1,
        variants: [
          {
            id: "variant_1",
            status: "failed",
            variantIndex: 0,
          },
        ],
      },
    });

    const markup = renderToStaticMarkup(
      <HookLabIdeaUseProgressPanel useId="use_4" />,
    );

    expect(markup).toContain("This Stitch couldn’t be finished.");
    expect(markup).not.toContain("Review Stitch");
  });
});
