import { describe, expect, it } from "vitest";
import { createStudioEditorTestFixture } from "@/lib/clipstitchr/studio/editor/test/createStudioEditorTestFixture";
import { createStudioEditorVideoClipSaveArgs } from "./createStudioEditorVideoClipSaveArgs";

describe("createStudioEditorVideoClipSaveArgs", () => {
  it("binds a finished Studio MP4 to the active Product Library", () => {
    const { project } = createStudioEditorTestFixture();
    const result = createStudioEditorVideoClipSaveArgs({
      clipId: "clip_final",
      exported: {
        blob: new Blob(["video"], { type: "video/mp4" }),
        duration: 6,
        mimeType: "video/mp4",
        width: 1080,
        height: 1920,
        hasAudio: true,
      },
      posterObject: { key: "users/u/studio/poster.jpg", size: 10, contentType: "image/jpeg" },
      productId: "product_1",
      project,
      updatedAt: "2026-08-12T12:00:00.000Z",
      videoObject: { key: "users/u/studio/output.mp4", size: 50, contentType: "video/mp4" },
    });

    expect(result).toMatchObject({
      id: "clip_final",
      productId: "product_1",
      clipType: "ugc",
      duration: 6,
      width: 1080,
      height: 1920,
      hasAudio: true,
    });
    expect(result.tags).toEqual(expect.arrayContaining(["ugc", "studio-editor"]));
    expect(result.videoObject.key).toContain("studio/output.mp4");
  });
});
