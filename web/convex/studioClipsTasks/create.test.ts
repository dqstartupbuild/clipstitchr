import { beforeEach, describe, expect, it, vi } from "vitest";
import { create } from "./create";

type ConvexFunction = {
  handler: (ctx: never, args: never) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  auth: vi.fn(),
  availability: vi.fn(),
  consume: vi.fn(),
  createReceipt: vi.fn(),
  fingerprint: vi.fn(),
  getActiveWork: vi.fn(),
  getActiveTask: vi.fn(),
  getReceipt: vi.fn(),
  getTask: vi.fn(),
  mutation: vi.fn((definition) => definition),
  product: vi.fn(),
  toDetail: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ mutation: mocks.mutation }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.auth,
}));
vi.mock("../studioBetaAccess/assertStudioBetaAccess", () => ({
  assertStudioBetaAccess: mocks.access,
}));
vi.mock("../studioClipsRateLimits/consumeStudioClipsTaskCreateRateLimits", () => ({
  consumeStudioClipsTaskCreateRateLimits: mocks.consume,
}));
vi.mock("./assertStudioClipsActiveProduct", () => ({
  assertStudioClipsActiveProduct: mocks.product,
}));
vi.mock("./createStudioClipsRequestFingerprint", () => ({
  createStudioClipsRequestFingerprint: mocks.fingerprint,
}));
vi.mock("./createStudioClipsWriteReceipt", () => ({
  createStudioClipsWriteReceipt: mocks.createReceipt,
}));
vi.mock("./getStudioClipsExecutionAvailability", () => ({
  getStudioClipsExecutionAvailability: mocks.availability,
}));
vi.mock("./getActiveStudioClipsTaskForOwnerProduct", () => ({
  getActiveStudioClipsTaskForOwnerProduct: mocks.getActiveTask,
}));
vi.mock("../studioClipsRenderRevisions/getStudioClipsProductHasActiveWork", () => ({
  getStudioClipsProductHasActiveWork: mocks.getActiveWork,
}));
vi.mock("../studioClipsProductStyles/getForOwnerProduct", () => ({
  getStudioClipsProductStyleForOwnerProduct: vi.fn().mockResolvedValue(null),
}));
vi.mock("./getStudioClipsTaskForOwnerProduct", () => ({
  getStudioClipsTaskForOwnerProduct: mocks.getTask,
}));
vi.mock("./getStudioClipsWriteReceipt", () => ({
  getStudioClipsWriteReceipt: mocks.getReceipt,
}));
vi.mock("./toStudioClipsTaskDetail", () => ({
  toStudioClipsTaskDetail: mocks.toDetail,
}));

function handler() {
  return (create as unknown as ConvexFunction).handler;
}

const args = {
  id: "task_1",
  idempotencyKey: "request_1",
  options: {
    addSubtitles: true,
    captionStyle: { templateId: "minimal" },
    includeBroll: false,
    outputFormat: "vertical" as const,
  },
  productId: "product_1",
  schemaVersion: "studio-clips-create-v1" as const,
  source: {
    kind: "youtube" as const,
    url: "https://youtu.be/dQw4w9WgXcQ",
  },
};

describe("studioClipsTasks.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
    mocks.access.mockResolvedValue({ hasAccess: true });
    mocks.product.mockResolvedValue({ id: "product_1" });
    mocks.getReceipt.mockResolvedValue(null);
    mocks.fingerprint.mockResolvedValue("fingerprint_1");
    mocks.getActiveTask.mockResolvedValue(null);
    mocks.getActiveWork.mockResolvedValue(false);
    mocks.availability.mockReturnValue({
      message: "Adapter missing.",
      reasonCode: "worker_adapter_not_configured",
      state: "unavailable",
    });
    mocks.toDetail.mockResolvedValue({ id: "task_1", status: "provider_unavailable" });
  });

  it("persists an honest unavailable task after access, ownership, and rate gates", async () => {
    const task = { _id: "task_doc", id: "task_1", productId: "product_1" };
    mocks.getTask.mockResolvedValueOnce(null).mockResolvedValueOnce(task);
    const ctx = { db: { insert: vi.fn() } };
    await expect(handler()(ctx as never, args as never)).resolves.toMatchObject({
      created: true,
      task: { status: "provider_unavailable" },
    });
    expect(mocks.consume).toHaveBeenCalledWith(ctx, "owner_1");
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "studioClipsTasks",
      expect.objectContaining({
        status: "provider_unavailable",
        progressPercent: 0,
        recordVersion: 1,
      }),
    );
    expect(mocks.createReceipt).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ operation: "create", requestFingerprint: "fingerprint_1" }),
    );
  });

  it("replays a matching receipt without consuming another task-create budget", async () => {
    const task = { _id: "task_doc", id: "task_1", productId: "product_1" };
    mocks.getReceipt.mockResolvedValue({
      operation: "create",
      productId: "product_1",
      requestFingerprint: "fingerprint_1",
      targetId: "task_1",
    });
    mocks.getTask.mockResolvedValue(task);
    const ctx = { db: { insert: vi.fn() } };
    await expect(handler()(ctx as never, args as never)).resolves.toMatchObject({
      created: false,
    });
    expect(mocks.consume).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("rejects a second runnable task for the same Product", async () => {
    mocks.availability.mockReturnValue({ state: "available" });
    mocks.getTask.mockResolvedValue(null);
    mocks.getActiveWork.mockResolvedValue(true);
    const ctx = { db: { insert: vi.fn() } };
    await expect(handler()(ctx as never, args as never)).rejects.toThrow(
      "already has an active",
    );
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
