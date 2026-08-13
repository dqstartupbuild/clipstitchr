import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStudioEditorProjectV1 } from "../../lib/clipstitchr/studio/editor/createStudioEditorProjectV1";
import { createStudioEditorTestFixture } from "../../lib/clipstitchr/studio/editor/test/createStudioEditorTestFixture";
import { create } from "./create";

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
vi.mock("./getStudioEditorProjectForOwner", () => ({
  getStudioEditorProjectForOwner: mocks.getProject,
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

function getHandler() {
  return (create as unknown as ConvexFunction).handler;
}

const project = createStudioEditorProjectV1({
  id: "editor_project_1",
  productId: "product_1",
  name: "Launch cut",
  sceneId: "scene_1",
  visualTrackId: "visual_1",
  audioTrackId: "audio_1",
  captionTrackId: "caption_1",
});
const args = {
  id: project.id,
  productId: project.productId,
  name: project.name,
  idempotencyKey: "request_1",
  snapshotJson: JSON.stringify(project),
};

describe("studioEditorProjects.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
    mocks.access.mockResolvedValue({ hasAccess: true });
    mocks.product.mockResolvedValue({ id: "product_1" });
    mocks.fingerprint.mockResolvedValue("fingerprint_1");
    mocks.getReceipt.mockResolvedValue(null);
    mocks.getProject.mockResolvedValue(null);
  });

  it("checks Studio and active Product access before persistence", async () => {
    mocks.access.mockRejectedValue(new Error("Studio Beta access denied."));
    const ctx = { db: { insert: vi.fn() } };
    await expect(getHandler()(ctx as never, args as never)).rejects.toThrow(
      "access denied",
    );
    expect(mocks.product).not.toHaveBeenCalled();
    expect(mocks.consume).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("persists revision one and an exact idempotency receipt after both rate limits", async () => {
    const ctx = { db: { insert: vi.fn().mockResolvedValue("project_doc") } };
    await expect(getHandler()(ctx as never, args as never)).resolves.toEqual({
      created: true,
      projectId: "editor_project_1",
      revision: 1,
      status: "active",
    });
    expect(mocks.consume).toHaveBeenCalledWith(ctx, "owner_1");
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "studioEditorProjects",
      expect.objectContaining({
        ownerId: "owner_1",
        revision: 1,
        snapshotVersion: 1,
        snapshotJson: JSON.stringify(project),
      }),
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "studioEditorProjectRevisions",
      expect.objectContaining({
        operation: "create",
        projectId: project.id,
        revision: 1,
        snapshotJson: JSON.stringify(project),
        status: "active",
      }),
    );
    expect(mocks.createReceipt).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        operation: "create",
        requestFingerprint: "fingerprint_1",
      }),
    );
  });

  it("rejects a cross-owner Studio upload source before cost or persistence", async () => {
    const poisonedProject = structuredClone(project);
    const { image } = createStudioEditorTestFixture();
    poisonedProject.scenes[0].tracks[0].layers.push({
      ...image,
      source: {
        kind: "studioUpload",
        objectKey:
          "users/owner_2/studio/v1/media-source/product_1/upload_1/image.png",
      },
    });
    const ctx = { db: { insert: vi.fn() } };

    await expect(
      getHandler()(ctx as never, {
        ...args,
        snapshotJson: JSON.stringify(poisonedProject),
      } as never),
    ).rejects.toThrow("outside this Product or account");
    expect(mocks.consume).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("returns a matching idempotent retry without another limit or insert", async () => {
    mocks.getReceipt.mockResolvedValue({
      projectId: project.id,
      productId: project.productId,
      idempotencyKey: "request_1",
      operation: "create",
      requestFingerprint: "fingerprint_1",
      resultingRevision: 1,
      resultingStatus: "active",
    });
    const ctx = { db: { insert: vi.fn() } };
    await expect(
      getHandler()(ctx as never, args as never),
    ).resolves.toMatchObject({
      created: false,
      revision: 1,
    });
    expect(mocks.consume).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("rejects an idempotency key reused for different input", async () => {
    mocks.getReceipt.mockResolvedValue({
      projectId: project.id,
      productId: project.productId,
      operation: "create",
      requestFingerprint: "different",
    });
    await expect(
      getHandler()({ db: { insert: vi.fn() } } as never, args as never),
    ).rejects.toThrow("reused");
    expect(mocks.consume).not.toHaveBeenCalled();
  });
});
