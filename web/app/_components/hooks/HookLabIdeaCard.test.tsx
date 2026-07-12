import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HookLabIdeaCard } from "@/app/_components/hooks/HookLabIdeaCard";
import type { HookLabIdea } from "@/lib/clipstitchr/types/HookLabIdea";

const mocks = vi.hoisted(() => ({
  progressUseId: null as string | null,
  thumbnailObjectKey: null as string | null,
}));

vi.mock("@/app/_components/hooks/HookLabIdeaUseProgressPanel", () => ({
  HookLabIdeaUseProgressPanel: ({ useId }: { useId: string }) => {
    mocks.progressUseId = useId;
    return "HookLabIdeaUseProgressPanel";
  },
}));

vi.mock("@/app/_components/hooks/HookLabIdeaThumbnail", () => ({
  HookLabIdeaThumbnail: ({
    thumbnailObject,
  }: {
    thumbnailObject?: { key: string };
  }) => {
    mocks.thumbnailObjectKey = thumbnailObject?.key ?? null;
    return "HookLabIdeaThumbnail";
  },
}));

const idea: HookLabIdea = {
  createdAt: "2026-07-12T12:00:00.000Z",
  hasCreativeBeat: true,
  hasStitchRecipe: true,
  hasTextPattern: true,
  id: "idea_1",
  name: "The honest before-and-after",
  scope: "shared",
  sourceStitchId: "stitch_1",
  sourceType: "stitch",
  status: "ready",
  thumbnailObject: {
    contentType: "image/jpeg",
    key: "hook-lab/idea_1/thumbnail.jpg",
    size: 2048,
  },
  updatedAt: "2026-07-12T12:00:00.000Z",
  useCount: 3,
  whatToRepeat: "Start doubtful, then let the demo prove the turnaround.",
};

describe("HookLabIdeaCard", () => {
  it("shows the reusable capabilities and one-click use controls", () => {
    const markup = renderToStaticMarkup(
      <HookLabIdeaCard
        activeProductId="product_1"
        currentUseId="use_1"
        idea={idea}
        isArchiving={false}
        isDeleting={false}
        isRetrying={false}
        isSaving={false}
        isUsing={false}
        onArchive={vi.fn()}
        onDelete={vi.fn(async () => undefined)}
        onPasteInstead={vi.fn()}
        onRetry={vi.fn()}
        onUpdate={vi.fn(async () => undefined)}
        onUse={vi.fn()}
      />,
    );

    expect(markup).toContain("The honest before-and-after");
    expect(markup).toContain("Text pattern");
    expect(markup).toContain("Creative beat");
    expect(markup).toContain("Saved setup");
    expect(markup).toContain("Number of versions");
    expect(markup).toContain("Use idea");
    expect(markup).toContain("3 uses");
    expect(mocks.thumbnailObjectKey).toBe(
      "hook-lab/idea_1/thumbnail.jpg",
    );
    expect(mocks.progressUseId).toBe("use_1");
  });
});
