import { describe, expect, it } from "vitest";
import { applyStudioEditorCommand } from "@/lib/clipstitchr/studio/editor/applyStudioEditorCommand";
import { createStudioEditorTestFixture } from "@/lib/clipstitchr/studio/editor/test/createStudioEditorTestFixture";
import { getStudioEditorResolvedSources } from "./getStudioEditorResolvedSources";

describe("getStudioEditorResolvedSources", () => {
  it("resolves only timeline sources and preserves durable Studio uploads", () => {
    const { project, image, video } = createStudioEditorTestFixture();
    const withVideo = applyStudioEditorCommand(project, {
      type: "addLayer",
      sceneId: project.activeSceneId,
      trackId: project.scenes[0].tracks[0].id,
      index: 0,
      layer: video,
    });
    const withImage = applyStudioEditorCommand(withVideo, {
      type: "addLayer",
      sceneId: project.activeSceneId,
      trackId: project.scenes[0].tracks[0].id,
      index: 1,
      layer: image,
    });
    const sources = getStudioEditorResolvedSources(withImage, {
      videoClips: [
        {
          kind: "videoClip",
          id: "clip_1",
          name: "Opening",
          durationSeconds: 20,
          width: 1080,
          height: 1920,
          hasAudio: true,
          objectKey: "users/u/clips/opening.mp4",
        },
        {
          kind: "videoClip",
          id: "unused",
          name: "Unused",
          durationSeconds: 2,
          width: 1080,
          height: 1920,
          hasAudio: false,
          objectKey: "users/u/clips/unused.mp4",
        },
      ],
      stitches: [],
    });

    expect(sources).toEqual([
      expect.objectContaining({ identity: "videoClip:clip_1", objectKey: "users/u/clips/opening.mp4" }),
      expect.objectContaining({ identity: "studioUpload:studio/uploads/product.png", objectKey: "studio/uploads/product.png" }),
    ]);
    expect(sources.some((source) => source.identity.includes("unused"))).toBe(false);
  });
});
