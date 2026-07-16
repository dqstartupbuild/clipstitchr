import { describe, expect, it, vi } from "vitest";
import { getGenerationSlotForQueue } from "./getGenerationSlotForQueue";

const now = "2026-07-16T12:00:00.000Z";

function createContext(slot: unknown) {
  const queryChain = {
    unique: vi.fn(async () => slot),
    withIndex: vi.fn(
      (_name: string, callback: (query: { eq: () => unknown }) => unknown) => {
        const query = { eq: vi.fn(() => query) };
        callback(query);
        return queryChain;
      },
    ),
  };

  return {
    db: {
      query: vi.fn(() => queryChain),
    },
  };
}

describe("getGenerationSlotForQueue", () => {
  it("rejects an expired inherited slot before it reaches a queue entry", async () => {
    const ctx = createContext({
      expiresAt: "2026-07-16T11:59:59.999Z",
      idempotencyKey: "provider:provider_job:job_1",
      ownerId: "owner_1",
      state: "active",
      worker: "provider",
    });

    await expect(
      getGenerationSlotForQueue(ctx as never, {
        generationSlotId: "generation:provider:job_1",
        now,
        ownerId: "owner_1",
        sourceKind: "media_job",
        worker: "media",
      }),
    ).rejects.toThrow("Generation slot is not active");
  });

  it("allows only the provider-to-media worker mismatch used by handoff", async () => {
    const providerSlot = {
      expiresAt: "2026-07-16T12:30:00.000Z",
      idempotencyKey: "provider:provider_job:job_1",
      ownerId: "owner_1",
      state: "active",
      worker: "provider",
    };

    await expect(
      getGenerationSlotForQueue(createContext(providerSlot) as never, {
        generationSlotId: "generation:provider:job_1",
        now,
        ownerId: "owner_1",
        sourceKind: "media_job",
        worker: "media",
      }),
    ).resolves.toBe(providerSlot);
    await expect(
      getGenerationSlotForQueue(
        createContext({ ...providerSlot, worker: "media" }) as never,
        {
          generationSlotId: "generation:media:job_1",
          now,
          ownerId: "owner_1",
          sourceKind: "provider_job",
          worker: "provider",
        },
      ),
    ).rejects.toThrow("Generation slot is not active");
  });

  it("rejects a browser-provenance slot from worker queue inheritance", async () => {
    const browserSlot = {
      expiresAt: "2026-07-16T12:30:00.000Z",
      idempotencyKey: "browser:stitch:stitch_1",
      ownerId: "owner_1",
      provenance: "browser",
      state: "active",
      worker: "media",
    };

    await expect(
      getGenerationSlotForQueue(createContext(browserSlot) as never, {
        generationSlotId: "generation:browser:stitch:stitch_1",
        now,
        ownerId: "owner_1",
        sourceKind: "media_job",
        worker: "media",
      }),
    ).rejects.toThrow("Generation slot is not active");
  });
});
