import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SwiprSwipesSection } from "@/app/_components/dashboard/SwiprSwipesSection";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

vi.mock("@/app/_components/dashboard/SwiprSwipeCard", () => ({
  SwiprSwipeCard: ({
    background,
    swipe,
  }: {
    background?: SwiprBackgroundAsset;
    swipe: SwiprSwipe;
  }) => (
    <article>
      Swipe {swipe.id} {background ? "has photo" : "missing photo"}
    </article>
  ),
}));

function createBackground(
  overrides: Partial<SwiprBackgroundAsset> = {},
): SwiprBackgroundAsset {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    height: 1920,
    id: "background_1",
    imageObject: {
      contentType: "image/jpeg",
      key: "background.jpg",
      size: 100,
    },
    mimeType: "image/jpeg",
    name: "Studio",
    size: 100,
    source: "upload",
    tags: ["studio"],
    width: 1080,
    ...overrides,
  };
}

function createSwipe(id: string, backgroundId: string): SwiprSwipe {
  return {
    backgroundId,
    createdAt: "2026-05-20T00:00:00.000Z",
    id,
    name: id,
    productContext: "Launch context",
    productName: "Launch Kit",
    productSourceId: "product_1",
    productSourceType: "saved-product",
    slides: [],
    updatedAt: "2026-05-20T00:00:00.000Z",
  };
}

describe("SwiprSwipesSection", () => {
  it("keeps Swipes visible when their saved photo record is missing", () => {
    const markup = renderToStaticMarkup(
      <SwiprSwipesSection
        backgrounds={[createBackground()]}
        swipes={[
          createSwipe("swipe_1", "background_1"),
          createSwipe("swipe_2", "missing_background"),
        ]}
        onDelete={vi.fn()}
        onLoadBackgroundBlob={async () => new Blob()}
      />,
    );

    expect(markup).toContain("Swipe swipe_1 has photo");
    expect(markup).toContain("Swipe swipe_2 missing photo");
  });
});
