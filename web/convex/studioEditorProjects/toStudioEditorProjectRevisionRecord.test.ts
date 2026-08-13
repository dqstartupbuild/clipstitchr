import { describe, expect, it } from "vitest";
import { toStudioEditorProjectRevisionRecord } from "./toStudioEditorProjectRevisionRecord";

describe("toStudioEditorProjectRevisionRecord", () => {
  it("returns the immutable public revision without owner or Convex internals", () => {
    expect(
      toStudioEditorProjectRevisionRecord({
        _creationTime: 1,
        _id: "revision_doc",
        createdAt: "2026-08-12T00:00:00.000Z",
        name: "Launch cut",
        operation: "autosave",
        ownerId: "owner_1",
        productId: "product_1",
        projectId: "editor_project_1",
        recordVersion: 1,
        revision: 4,
        snapshotByteLength: 42,
        snapshotJson: '{"version":1}',
        snapshotVersion: 1,
        status: "active",
      } as never),
    ).toEqual({
      createdAt: "2026-08-12T00:00:00.000Z",
      name: "Launch cut",
      operation: "autosave",
      productId: "product_1",
      projectId: "editor_project_1",
      revision: 4,
      snapshotByteLength: 42,
      snapshotJson: '{"version":1}',
      snapshotVersion: 1,
      status: "active",
    });
  });
});
