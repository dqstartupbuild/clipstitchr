import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { StudioStitchOutput } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchOutput";
import { StudioStitchOutputCard } from "./StudioStitchOutputCard";

const generatedOutput = {
  id: "output_1",
  recipeId: "recipe_1",
  status: "generated",
  durationSeconds: 15,
  byteLength: 4_194_304,
  objectKey: "products/product_1/stitch/output_1.mp4",
  revision: 1,
} as StudioStitchOutput;

describe("StudioStitchOutputCard", () => {
  it("presents real Product Library materialization without exposing storage keys", () => {
    const markup = renderToStaticMarkup(
      <StudioStitchOutputCard
        isBusy={false}
        onMaterialize={vi.fn()}
        output={generatedOutput}
      />,
    );

    expect(markup).toContain("Accept and save this video");
    expect(markup).toContain("verify the finished MP4");
    expect(markup).toContain("Accept and save video");
    expect(markup).not.toContain("metadata only");
    expect(markup).not.toContain(generatedOutput.objectKey);
  });

  it("opens materialized output destinations with Product-grounded identifiers", () => {
    const markup = renderToStaticMarkup(
      <StudioStitchOutputCard
        isBusy={false}
        onMaterialize={vi.fn()}
        output={{
          ...generatedOutput,
          status: "accepted",
          revision: 2,
          handoff: {
            libraryAssetId: "library_clip_1",
            publishingSourceId: "publishing_source_1",
          },
        } as StudioStitchOutput}
      />,
    );

    expect(markup).toContain("Open editor");
    expect(markup).toContain(
      "/dashboard/studio/edit?sourceId=library_clip_1",
    );
    expect(markup).toContain("Open publishing");
    expect(markup).toContain(
      "/dashboard/studio/publishing/compose?kind=studio-stitch-output&amp;recordId=publishing_source_1",
    );
    expect(markup).toContain("Open Library");
    expect(markup).toContain("opens with this saved video selected");
    expect(markup).not.toContain("Adapter unavailable");
  });
});
