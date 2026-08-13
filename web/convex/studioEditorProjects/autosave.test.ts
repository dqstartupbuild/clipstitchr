import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStudioEditorProjectV1 } from "../../lib/clipstitchr/studio/editor/createStudioEditorProjectV1";
import { createStudioEditorTestFixture } from "../../lib/clipstitchr/studio/editor/test/createStudioEditorTestFixture";
import { autosave } from "./autosave";

type ConvexFunction = {
  handler: (ctx: never, args: never) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  access: vi.fn(),
  product: vi.fn(),
  consume: vi.fn(),
  getProject: vi.fn(),
  getReceipt: vi.fn(),
  createReceipt: vi.fn(),
  fingerprint: vi.fn(),
  mutation: vi.fn((definition) => definition),
}));
vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.auth,
}));
vi.mock("../studioBetaAccess/assertStudioBetaAccess", () => ({
  assertStudioBetaAccess: mocks.access,
}));
vi.mock(
  "../studioEditorRateLimits/consumeStudioEditorProjectWriteRateLimits",
  () => ({ consumeStudioEditorProjectWriteRateLimits: mocks.consume }),
);
vi.mock("./assertStudioEditorActiveProduct", () => ({
  assertStudioEditorActiveProduct: mocks.product,
}));
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

const project = createStudioEditorProjectV1({
  id: "editor_project_1",
  productId: "product_1",
  name: "Revision two",
  sceneId: "scene_1",
  visualTrackId: "visual_1",
  audioTrackId: "audio_1",
  captionTrackId: "caption_1",
});
const args = {
  id: project.id,
  productId: project.productId,
  expectedRevision: 1,
  idempotencyKey: "save_1",
  snapshotJson: JSON.stringify(project),
};
const getHandler = () => (autosave as unknown as ConvexFunction).handler;

describe("studioEditorProjects.autosave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
    mocks.fingerprint.mockResolvedValue("fingerprint_1");
    mocks.getReceipt.mockResolvedValue(null);
    mocks.getProject.mockResolvedValue({
      _id: "doc_1",
      revision: 1,
      snapshotVersion: 1,
      status: "active",
    });
  });

  it("applies an optimistic revision and stores a retry receipt", async () => {
    const ctx = { db: { insert: vi.fn(), patch: vi.fn() } };
    await expect(getHandler()(ctx as never, args as never)).resolves.toEqual({
      created: true,
      projectId: project.id,
      revision: 2,
      status: "active",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({ name: "Revision two", revision: 2 }),
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "studioEditorProjectRevisions",
      expect.objectContaining({
        operation: "autosave",
        projectId: project.id,
        revision: 2,
        snapshotJson: JSON.stringify(project),
      }),
    );
    expect(mocks.consume.mock.invocationCallOrder[0]).toBeLessThan(
      ctx.db.patch.mock.invocationCallOrder[0],
    );
    expect(mocks.createReceipt).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ resultingRevision: 2, operation: "autosave" }),
    );
  });

  it("rejects a cross-Product Studio upload source before cost or persistence", async () => {
    const poisonedProject = structuredClone(project);
    const { image } = createStudioEditorTestFixture();
    poisonedProject.scenes[0].tracks[0].layers.push({
      ...image,
      source: {
        kind: "studioUpload",
        objectKey:
          "users/owner_1/studio/v1/media-source/product_2/upload_1/image.png",
      },
    });
    const ctx = { db: { insert: vi.fn(), patch: vi.fn() } };

    await expect(
      getHandler()(ctx as never, {
        ...args,
        snapshotJson: JSON.stringify(poisonedProject),
      } as never),
    ).rejects.toThrow("outside this Product or account");
    expect(mocks.consume).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("rejects stale revisions and archived projects before consuming limits", async () => {
    mocks.getProject.mockResolvedValueOnce({
      _id: "doc_1",
      revision: 2,
      status: "active",
    });
    await expect(
      getHandler()({ db: { patch: vi.fn() } } as never, args as never),
    ).rejects.toThrow("revision conflict");
    mocks.getProject.mockResolvedValueOnce({
      _id: "doc_1",
      revision: 1,
      status: "archived",
    });
    await expect(
      getHandler()({ db: { patch: vi.fn() } } as never, args as never),
    ).rejects.toThrow("cannot be autosaved");
    expect(mocks.consume).not.toHaveBeenCalled();
  });

  it("returns the original result for an exact retry even after the live revision moved", async () => {
    mocks.getReceipt.mockResolvedValue({
      projectId: project.id,
      productId: project.productId,
      operation: "autosave",
      requestFingerprint: "fingerprint_1",
      resultingRevision: 2,
      resultingStatus: "active",
    });
    mocks.getProject.mockResolvedValue({
      _id: "doc_1",
      revision: 8,
      status: "active",
    });
    await expect(
      getHandler()({ db: { patch: vi.fn() } } as never, args as never),
    ).resolves.toMatchObject({
      created: false,
      revision: 2,
    });
    expect(mocks.getProject).not.toHaveBeenCalled();
    expect(mocks.consume).not.toHaveBeenCalled();
  });
});
