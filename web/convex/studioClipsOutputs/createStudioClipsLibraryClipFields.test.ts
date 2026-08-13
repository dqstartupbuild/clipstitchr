import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import type { StudioClipsOutputEditState } from "../../lib/clipstitchr/types/studioClips/StudioClipsOutputEditState";
import { createStudioClipsDefaultEditState } from "./createStudioClipsDefaultEditState";
import { createStudioClipsLibraryClipFields } from "./createStudioClipsLibraryClipFields";

function createOutput(
  edit: StudioClipsOutputEditState = {
    ...createStudioClipsDefaultEditState(),
    acceptance: { state: "accepted" as const, updatedAt: "2026-08-12T00:00:00.000Z" },
  },
): Doc<"studioClipsOutputs"> {
  return {
    _creationTime: 1,
    _id: "output_document" as Doc<"studioClipsOutputs">["_id"],
    artifactId: "best_hook",
    audioCodec: "aac",
    contentType: "video/mp4",
    createdAt: "2026-08-12T00:00:00.000Z",
    durationSeconds: 12,
    editSnapshotByteLength: 1,
    editSnapshotJson: JSON.stringify(edit),
    editSnapshotVersion: 1,
    fileName: "best-hook.mp4",
    hasAudio: true,
    height: 1920,
    id: "output_1",
    objectKey:
      "users/user_1/studio/v1/studio-clips/product_1/task_1/best_hook/best-hook.mp4",
    ownerId: "user_1",
    productId: "product_1",
    recordVersion: 1,
    revision: 2,
    sha256: "a".repeat(64),
    sizeBytes: 100,
    taskId: "task_1",
    updatedAt: "2026-08-12T00:00:00.000Z",
    videoCodec: "h264",
    width: 1080,
  };
}

describe("createStudioClipsLibraryClipFields", () => {
  it("creates a Product-owned Library clip from accepted probed output", () => {
    const fields = createStudioClipsLibraryClipFields(createOutput(), {
      libraryClipId: "studio_clips_output_1",
      now: "2026-08-12T01:00:00.000Z",
      ownerId: "user_1",
      productId: "product_1",
    });

    expect(fields).toMatchObject({
      aspectRatio: 1080 / 1920,
      clipType: "ugc",
      defaultTrimRange: { end: 12, start: 0 },
      duration: 12,
      hasAudio: true,
      height: 1920,
      id: "studio_clips_output_1",
      productId: "product_1",
      videoObject: {
        contentType: "video/mp4",
        key: expect.stringContaining("best-hook.mp4"),
        size: 100,
      },
      width: 1080,
    });
  });

  it("preserves a saved non-destructive trim and refuses unaccepted output", () => {
    const accepted = createStudioClipsDefaultEditState();
    accepted.acceptance = {
      state: "accepted",
      updatedAt: "2026-08-12T00:00:00.000Z",
    };
    accepted.trim = { endSeconds: 8, startSeconds: 2 };
    expect(
      createStudioClipsLibraryClipFields(createOutput(accepted), {
        libraryClipId: "studio_clips_output_1",
        now: "2026-08-12T01:00:00.000Z",
        ownerId: "user_1",
        productId: "product_1",
      }).defaultTrimRange,
    ).toEqual({ end: 8, start: 2 });

    expect(() =>
      createStudioClipsLibraryClipFields(
        createOutput(createStudioClipsDefaultEditState()),
        {
          libraryClipId: "studio_clips_output_1",
          now: "2026-08-12T01:00:00.000Z",
          ownerId: "user_1",
          productId: "product_1",
        },
      ),
    ).toThrow("Accept");
  });
});
