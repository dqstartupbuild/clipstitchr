import { beforeEach, describe, expect, it, vi } from "vitest";
import { writeStudioClipsTaskLifecycle } from "./writeStudioClipsTaskLifecycle";

const mocks = vi.hoisted(() => ({
  consume: vi.fn(),
  createReceipt: vi.fn(),
  execution: vi.fn(),
  fingerprint: vi.fn(),
  getActiveTask: vi.fn(),
  getReceipt: vi.fn(),
  getTask: vi.fn(),
  toDetail: vi.fn(),
}));

vi.mock("../studioClipsRateLimits/consumeStudioClipsRecordWriteRateLimits", () => ({
  consumeStudioClipsRecordWriteRateLimits: mocks.consume,
}));
vi.mock("./createStudioClipsRequestFingerprint", () => ({
  createStudioClipsRequestFingerprint: mocks.fingerprint,
}));
vi.mock("./createStudioClipsWriteReceipt", () => ({
  createStudioClipsWriteReceipt: mocks.createReceipt,
}));
vi.mock("../studioClipsRenderRevisions/getStudioClipsProductHasActiveWork", () => ({
  getStudioClipsProductHasActiveWork: mocks.getActiveTask,
}));
vi.mock("./getStudioClipsExecutionAvailability", () => ({
  getStudioClipsExecutionAvailability: mocks.execution,
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

describe("writeStudioClipsTaskLifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fingerprint.mockResolvedValue("fingerprint_1");
    mocks.getReceipt.mockResolvedValue(null);
    mocks.getTask.mockResolvedValue({
      _id: "task_doc",
      attempt: 1,
      id: "task_1",
      productId: "product_1",
      revision: 2,
      status: "error",
    });
    mocks.execution.mockReturnValue({ state: "available" });
  });

  it("does not resume into a Product that already has another active task", async () => {
    mocks.getActiveTask.mockResolvedValue({ id: "task_2", status: "processing" });
    const ctx = { db: { patch: vi.fn() } };
    await expect(
      writeStudioClipsTaskLifecycle(ctx as never, {
        idempotencyKey: "resume_1",
        operation: "resume",
        ownerId: "owner_1",
        productId: "product_1",
        taskId: "task_1",
      }),
    ).rejects.toThrow("already has an active");
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(mocks.createReceipt).not.toHaveBeenCalled();
  });
});
