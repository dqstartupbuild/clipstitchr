import { beforeEach, describe, expect, it, vi } from "vitest";
import { changeStudioEditorProjectStatus } from "./changeStudioEditorProjectStatus";

const mocks = vi.hoisted(() => ({
  consume: vi.fn(),
  getProject: vi.fn(),
  getReceipt: vi.fn(),
  createReceipt: vi.fn(),
  fingerprint: vi.fn(),
}));
vi.mock(
  "../studioEditorRateLimits/consumeStudioEditorProjectWriteRateLimits",
  () => ({ consumeStudioEditorProjectWriteRateLimits: mocks.consume }),
);
vi.mock("./getStudioEditorProjectForOwnerProduct", () => ({
  getStudioEditorProjectForOwnerProduct: mocks.getProject,
}));
vi.mock("./getStudioEditorProjectWriteReceipt", () => ({
  getStudioEditorProjectWriteReceipt: mocks.getReceipt,
}));
vi.mock("./createStudioEditorProjectWriteReceipt", () => ({
  createStudioEditorProjectWriteReceipt: mocks.createReceipt,
}));
vi.mock("./createStudioEditorRequestFingerprint", () => ({
  createStudioEditorRequestFingerprint: mocks.fingerprint,
}));

const archiveInput = {
  ownerId: "owner_1",
  projectId: "editor_project_1",
  productId: "product_1",
  expectedRevision: 2,
  idempotencyKey: "archive_1",
  operation: "archive" as const,
  fromStatus: "active" as const,
  toStatus: "archived" as const,
};

describe("changeStudioEditorProjectStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fingerprint.mockResolvedValue("fingerprint_1");
    mocks.getReceipt.mockResolvedValue(null);
    mocks.getProject.mockResolvedValue({
      _id: "doc_1",
      name: "Launch cut",
      revision: 2,
      snapshotByteLength: 42,
      snapshotJson: '{"version":1}',
      snapshotVersion: 1,
      status: "active",
    });
  });

  it("archives instead of deleting and advances the optimistic revision", async () => {
    const ctx = { db: { patch: vi.fn(), delete: vi.fn(), insert: vi.fn() } };
    await expect(
      changeStudioEditorProjectStatus(ctx as never, archiveInput),
    ).resolves.toEqual({
      created: true,
      projectId: "editor_project_1",
      revision: 3,
      status: "archived",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({ status: "archived", revision: 3 }),
    );
    expect(ctx.db.delete).not.toHaveBeenCalled();
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "studioEditorProjectRevisions",
      expect.objectContaining({
        operation: "archive",
        revision: 3,
        snapshotJson: '{"version":1}',
        status: "archived",
      }),
    );
  });

  it("reopens an archived project and clears archivedAt", async () => {
    mocks.getProject.mockResolvedValue({
      _id: "doc_1",
      name: "Launch cut",
      revision: 3,
      snapshotByteLength: 42,
      snapshotJson: '{"version":1}',
      snapshotVersion: 1,
      status: "archived",
    });
    const ctx = { db: { insert: vi.fn(), patch: vi.fn() } };
    await changeStudioEditorProjectStatus(ctx as never, {
      ...archiveInput,
      expectedRevision: 3,
      idempotencyKey: "reopen_1",
      operation: "reopen",
      fromStatus: "archived",
      toStatus: "active",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({
        status: "active",
        revision: 4,
        archivedAt: undefined,
      }),
    );
  });

  it("rejects wrong status or stale revision before limits", async () => {
    mocks.getProject.mockResolvedValueOnce({
      _id: "doc_1",
      revision: 2,
      status: "archived",
    });
    await expect(
      changeStudioEditorProjectStatus(
        { db: { patch: vi.fn() } } as never,
        archiveInput,
      ),
    ).rejects.toThrow("must be active");
    mocks.getProject.mockResolvedValueOnce({
      _id: "doc_1",
      revision: 9,
      status: "active",
    });
    await expect(
      changeStudioEditorProjectStatus(
        { db: { patch: vi.fn() } } as never,
        archiveInput,
      ),
    ).rejects.toThrow("revision conflict");
    expect(mocks.consume).not.toHaveBeenCalled();
  });
});
