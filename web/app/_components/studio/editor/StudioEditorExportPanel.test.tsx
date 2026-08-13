import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { StudioEditorExportPanel } from "./StudioEditorExportPanel";

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: () => "blob:studio-edit",
}));
vi.mock("@/lib/clipstitchr/hooks/studioEditor/useStudioEditorExport", () => ({
  useStudioEditorExport: () => ({
    error: null,
    exportAndSave: vi.fn(),
    exported: { blob: new Blob(["video"], { type: "video/mp4" }) },
    isExporting: false,
    progress: 1,
    savedClipId: "library_clip_1",
  }),
}));

describe("StudioEditorExportPanel", () => {
  it("opens the saved Product video in the publishing composer", () => {
    const markup = renderToStaticMarkup(
      <StudioEditorExportPanel
        catalog={{ stitches: [], videoClips: [] }}
        productId="product_1"
        project={{
          activeSceneId: "scene_1",
          canvas: {
            backgroundColor: "#000000",
            fps: 30,
            height: 1920,
            width: 1080,
          },
          id: "project_1",
          name: "Launch edit",
          productId: "product_1",
          scenes: [],
          version: 1,
        }}
      />,
    );

    expect(markup).toContain("Saved to the active Product Library");
    expect(markup).toContain(
      "/dashboard/studio/publishing/compose?kind=library-media&amp;recordId=library_clip_1",
    );
    expect(markup).toContain("Open publishing");
  });
});
