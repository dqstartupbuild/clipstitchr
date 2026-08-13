import { describe, expect, it } from "vitest";
import { getStudioEditorActiveScene } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorActiveScene";
import { createStudioEditorProjectFromVideoSource } from "./createStudioEditorProjectFromVideoSource";

describe("createStudioEditorProjectFromVideoSource", () => {
  it("creates a deterministic populated project for a Product Library handoff", () => {
    const descriptor = {
      durationSeconds: 9,
      hasAudio: true,
      height: 1920,
      id: "studio_clips_output_1",
      kind: "videoClip" as const,
      name: "Best hook - Studio Clips",
      objectKey: "users/user_1/studio/output.mp4",
      width: 1080,
    };
    const first = createStudioEditorProjectFromVideoSource(
      "product_1",
      descriptor,
    );
    const second = createStudioEditorProjectFromVideoSource(
      "product_1",
      descriptor,
    );

    expect(second).toEqual(first);
    expect(first.id).toContain("studio_clips_output_1");
    expect(getStudioEditorActiveScene(first).tracks[0]?.layers[0]).toMatchObject({
      durationSeconds: 9,
      kind: "video",
      source: { kind: "videoClip", videoClipId: "studio_clips_output_1" },
      startSeconds: 0,
    });
  });
});
