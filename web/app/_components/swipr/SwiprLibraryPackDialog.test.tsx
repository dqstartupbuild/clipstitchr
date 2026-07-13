import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SwiprLibraryPackDialog } from "@/app/_components/swipr/SwiprLibraryPackDialog";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";

function createBackground(index: number): SwiprBackgroundAsset {
  return {
    createdAt: "2026-07-13T12:00:00.000Z",
    height: 1920,
    id: `background_${index}`,
    imageObject: {
      contentType: "image/jpeg",
      key: `pexels/background_${index}.jpg`,
      size: 1024,
    },
    libraryQuery: "calisthenics",
    mimeType: "image/jpeg",
    name: `Calisthenics photo ${index}`,
    pexelsPhotoId: index,
    size: 1024,
    source: "pexels",
    tags: ["calisthenics"],
    width: 1080,
  };
}

describe("SwiprLibraryPackDialog", () => {
  it("renders the first 12 pack photos with dialog pagination", () => {
    const backgrounds = Array.from({ length: 13 }, (_, index) =>
      createBackground(index + 1),
    );
    const markup = renderToStaticMarkup(
      <SwiprLibraryPackDialog
        backgrounds={backgrounds}
        isMine
        isSaving={false}
        pack={{
          count: backgrounds.length,
          coverBackgroundIds: backgrounds.slice(0, 4).map(({ id }) => id),
          name: "calisthenics",
        }}
        onDismiss={vi.fn()}
        onLoadBackgroundBlob={vi.fn()}
        onRemovePack={vi.fn()}
        onRemovePhoto={vi.fn()}
      />,
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain("1-12 of 13");
    expect(markup).toContain("Page 1 of 2");
    expect(markup).toContain("Calisthenics photo 12");
    expect(markup).not.toContain("Calisthenics photo 13");
    expect(markup).toContain('aria-label="Close pack photos"');
  });
});
