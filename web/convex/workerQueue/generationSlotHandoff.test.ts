import { beforeEach, describe, expect, it, vi } from "vitest";
import { assignGenerationSlotWorker } from "./assignGenerationSlotWorker";
import { prepareGenerationSlotHandoff } from "./prepareGenerationSlotHandoff";

const now = "2026-07-16T12:00:00.000Z";
const providerSlot = {
  _id: "slot_doc_1",
  domainJobId: "provider_job_1",
  expiresAt: "2026-07-16T12:30:00.000Z",
  ownerId: "owner_1",
  planKeySnapshot: "starter" as const,
  slotId: "generation:provider:job_1",
  state: "active" as const,
  tool: "clipr",
  worker: "provider" as const,
};

describe("generation slot handoff", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps one owner slot alive while releasing provider capacity", async () => {
    const handedOffSlot = { ...providerSlot, worker: undefined };
    const queryChain = {
      unique: vi.fn(async () => providerSlot),
      withIndex: vi.fn(
        (
          _name: string,
          callback: (query: { eq: () => unknown }) => unknown,
        ) => {
          const query = { eq: vi.fn(() => query) };
          callback(query);
          return queryChain;
        },
      ),
    };
    const ctx = {
      db: {
        get: vi.fn(async () => handedOffSlot),
        patch: vi.fn(async () => undefined),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(
      prepareGenerationSlotHandoff(ctx as never, providerSlot.slotId, now),
    ).resolves.toEqual(handedOffSlot);
    expect(ctx.db.patch).toHaveBeenCalledWith(
      providerSlot._id,
      expect.objectContaining({
        heartbeatAt: now,
        updatedAt: now,
        worker: undefined,
      }),
    );
  });

  it.each([
    [
      "an expired provider slot",
      { ...providerSlot, expiresAt: "2026-07-16T11:59:59.999Z" },
    ],
    ["a media-owned slot", { ...providerSlot, worker: "media" as const }],
    ["an unassigned slot", { ...providerSlot, worker: undefined }],
  ])("does not prepare %s for handoff", async (_label, rejectedSlot) => {
    const queryChain = {
      unique: vi.fn(async () => rejectedSlot),
      withIndex: vi.fn(
        (
          _name: string,
          callback: (query: { eq: () => unknown }) => unknown,
        ) => {
          const query = { eq: vi.fn(() => query) };
          callback(query);
          return queryChain;
        },
      ),
    };
    const ctx = {
      db: {
        get: vi.fn(),
        patch: vi.fn(),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(
      prepareGenerationSlotHandoff(ctx as never, rejectedSlot.slotId, now),
    ).resolves.toBeNull();
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.get).not.toHaveBeenCalled();
  });

  it("assigns that same slot to media without acquiring a second owner slot", async () => {
    const handedOffSlot = { ...providerSlot, worker: undefined };
    const mediaSlot = {
      ...handedOffSlot,
      domainJobId: "media_job_1",
      tool: "clipr-finalization",
      worker: "media" as const,
    };
    const queryChain = {
      collect: vi.fn(async () => [handedOffSlot]),
      unique: vi.fn(async () => handedOffSlot),
      withIndex: vi.fn(
        (
          _name: string,
          callback: (query: { eq: () => unknown }) => unknown,
        ) => {
          const query = { eq: vi.fn(() => query) };
          callback(query);
          return queryChain;
        },
      ),
    };
    const ctx = {
      db: {
        get: vi.fn(async () => mediaSlot),
        insert: vi.fn(),
        patch: vi.fn(async () => undefined),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(
      assignGenerationSlotWorker(ctx as never, {
        domainJobId: "media_job_1",
        now,
        ownerId: "owner_1",
        slotId: providerSlot.slotId,
        tool: "clipr-finalization",
        worker: "media",
      }),
    ).resolves.toEqual(mediaSlot);
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).toHaveBeenCalledWith(
      providerSlot._id,
      expect.objectContaining({
        domainJobId: "media_job_1",
        tool: "clipr-finalization",
        worker: "media",
      }),
    );
  });
});
