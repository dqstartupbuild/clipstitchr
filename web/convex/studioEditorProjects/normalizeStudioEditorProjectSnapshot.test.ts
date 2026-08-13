import { describe, expect, it } from "vitest";
import { createStudioEditorProjectV1 } from "../../lib/clipstitchr/studio/editor/createStudioEditorProjectV1";
import { STUDIO_EDITOR_PROJECT_SNAPSHOT_MAX_BYTES } from "../../lib/clipstitchr/studio/editor/studioEditorProjectSnapshotMaxBytes";
import { normalizeStudioEditorProjectSnapshot } from "./normalizeStudioEditorProjectSnapshot";

function createSnapshot() {
  return createStudioEditorProjectV1({
    id: "editor_project_1",
    productId: "product_1",
    name: "Launch cut",
    sceneId: "scene_1",
    visualTrackId: "visual_1",
    audioTrackId: "audio_1",
    captionTrackId: "caption_1",
  });
}

describe("normalizeStudioEditorProjectSnapshot", () => {
  it("parses, validates, and canonically serializes a matching v1 snapshot", () => {
    const snapshot = createSnapshot();
    const result = normalizeStudioEditorProjectSnapshot(
      JSON.stringify(snapshot, null, 2),
      {
        id: snapshot.id,
        ownerId: "owner_1",
        productId: snapshot.productId,
        name: snapshot.name,
      },
    );
    expect(result.project).toEqual(snapshot);
    expect(result.snapshotJson).toBe(JSON.stringify(snapshot));
    expect(result.byteLength).toBe(
      new TextEncoder().encode(result.snapshotJson).byteLength,
    );
  });

  it("rejects malformed, mismatched, and oversized snapshots", () => {
    const snapshot = createSnapshot();
    expect(() =>
      normalizeStudioEditorProjectSnapshot("not json", {
        id: snapshot.id,
        ownerId: "owner_1",
        productId: snapshot.productId,
      }),
    ).toThrow("valid JSON");
    expect(() =>
      normalizeStudioEditorProjectSnapshot(JSON.stringify(snapshot), {
        id: "another_project",
        ownerId: "owner_1",
        productId: snapshot.productId,
      }),
    ).toThrow("identity");
    expect(() =>
      normalizeStudioEditorProjectSnapshot(
        " ".repeat(STUDIO_EDITOR_PROJECT_SNAPSHOT_MAX_BYTES + 1),
        {
          id: snapshot.id,
          ownerId: "owner_1",
          productId: snapshot.productId,
        },
      ),
    ).toThrow("262144-byte cap");
  });
});
