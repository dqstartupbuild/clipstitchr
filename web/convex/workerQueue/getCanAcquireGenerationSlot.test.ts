import { describe, expect, it } from "vitest";
import { getCanAcquireGenerationSlot } from "./getCanAcquireGenerationSlot";

const now = "2026-07-16T12:00:00.000Z";
const future = "2026-07-16T13:00:00.000Z";

describe("getCanAcquireGenerationSlot", () => {
  it.each([
    ["starter", 1],
    ["pro", 2],
    ["agency", 4],
  ] as const)("enforces the %s owner limit", (planKey, limit) => {
    const slots = Array.from({ length: limit }, (_, index) => ({
      expiresAt: future,
      ownerId: "owner_1",
      state: "active",
      tool: `tool_${index}`,
      worker: "provider" as const,
    }));

    expect(
      getCanAcquireGenerationSlot({
        enforceOwnerLimit: true,
        globalLimit: 50,
        now,
        ownerId: "owner_1",
        planKey,
        slots: slots.slice(0, -1),
        tool: "clipr",
        toolLimit: null,
        worker: "provider",
      }),
    ).toBe(true);
    expect(
      getCanAcquireGenerationSlot({
        enforceOwnerLimit: true,
        globalLimit: 50,
        now,
        ownerId: "owner_1",
        planKey,
        slots,
        tool: "clipr",
        toolLimit: null,
        worker: "provider",
      }),
    ).toBe(false);
  });

  it("keeps provider and media global capacity independent", () => {
    const slots = [
      {
        expiresAt: future,
        ownerId: "provider_owner",
        state: "active",
        tool: "clipr",
        worker: "provider" as const,
      },
      {
        expiresAt: future,
        ownerId: "media_owner",
        state: "active",
        tool: "clipr-finalization",
        worker: "media" as const,
      },
    ];

    expect(
      getCanAcquireGenerationSlot({
        enforceOwnerLimit: true,
        globalLimit: 1,
        now,
        ownerId: "next_provider_owner",
        planKey: "agency",
        slots,
        tool: "swapr",
        toolLimit: null,
        worker: "provider",
      }),
    ).toBe(false);
    expect(
      getCanAcquireGenerationSlot({
        enforceOwnerLimit: true,
        globalLimit: 2,
        now,
        ownerId: "next_media_owner",
        planKey: "agency",
        slots,
        tool: "swapr-finalization",
        toolLimit: null,
        worker: "media",
      }),
    ).toBe(true);
  });

  it("enforces a tool cap only within the selected worker", () => {
    const slots = [
      {
        expiresAt: future,
        ownerId: "owner_1",
        state: "active",
        tool: "clipr",
        worker: "provider" as const,
      },
      {
        expiresAt: future,
        ownerId: "owner_2",
        state: "active",
        tool: "clipr",
        worker: "media" as const,
      },
    ];

    expect(
      getCanAcquireGenerationSlot({
        enforceOwnerLimit: true,
        globalLimit: 50,
        now,
        ownerId: "owner_3",
        planKey: "agency",
        slots,
        tool: "clipr",
        toolLimit: 1,
        worker: "provider",
      }),
    ).toBe(false);
    expect(
      getCanAcquireGenerationSlot({
        enforceOwnerLimit: true,
        globalLimit: 50,
        now,
        ownerId: "owner_3",
        planKey: "agency",
        slots,
        tool: "swapr",
        toolLimit: 1,
        worker: "provider",
      }),
    ).toBe(true);
  });

  it("ignores expired slots for owner, worker, and tool capacity", () => {
    const slots = [
      {
        expiresAt: "2026-07-16T11:59:59.999Z",
        ownerId: "owner_1",
        state: "active",
        tool: "clipr",
        worker: "provider" as const,
      },
    ];

    expect(
      getCanAcquireGenerationSlot({
        enforceOwnerLimit: true,
        globalLimit: 1,
        now,
        ownerId: "owner_1",
        planKey: "starter",
        slots,
        tool: "clipr",
        toolLimit: 1,
        worker: "provider",
      }),
    ).toBe(true);
  });

  it("blocks a second acquisition after the first transaction commits", () => {
    const slots: Array<{
      expiresAt: string;
      ownerId: string;
      state: string;
      tool: string;
      worker: "provider";
    }> = [];
    const decide = () =>
      getCanAcquireGenerationSlot({
        enforceOwnerLimit: true,
        globalLimit: 1,
        now,
        ownerId: "owner_1",
        planKey: "starter",
        slots,
        tool: "clipr",
        toolLimit: 1,
        worker: "provider",
      });

    expect(decide()).toBe(true);
    slots.push({
      expiresAt: future,
      ownerId: "owner_1",
      state: "active",
      tool: "clipr",
      worker: "provider",
    });
    expect(decide()).toBe(false);
  });

  it("keeps a handoff slot in the owner count without consuming worker capacity", () => {
    const slots = [
      {
        expiresAt: future,
        ownerId: "owner_1",
        state: "active",
        tool: "clipr",
      },
    ];

    expect(
      getCanAcquireGenerationSlot({
        enforceOwnerLimit: true,
        globalLimit: 1,
        now,
        ownerId: "owner_1",
        planKey: "starter",
        slots,
        tool: "clipr",
        toolLimit: null,
        worker: "provider",
      }),
    ).toBe(false);
    expect(
      getCanAcquireGenerationSlot({
        enforceOwnerLimit: false,
        globalLimit: 1,
        now,
        ownerId: "owner_1",
        planKey: "starter",
        slots,
        tool: "clipr-finalization",
        toolLimit: null,
        worker: "media",
      }),
    ).toBe(true);
  });
});
