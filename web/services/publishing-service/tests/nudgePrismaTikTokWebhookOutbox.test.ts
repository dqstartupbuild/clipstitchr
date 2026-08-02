import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import { derivePersonalTenantKey } from "../src/identity/derivePersonalTenantKey.js";
import { nudgePrismaTikTokWebhookOutbox } from "../src/webhooks/nudgePrismaTikTokWebhookOutbox.js";

const NUDGED_AT = new Date("2026-08-02T12:00:00.000Z");
const ATTEMPT = Object.freeze({
  attemptId: "attempt123",
  postStateId: "state123",
  tenantId: "tenant123",
  tenantKey: derivePersonalTenantKey("user_tiktok_webhook"),
});

describe("nudgePrismaTikTokWebhookOutbox", () => {
  it("only makes the matching pending poll event immediately available", async () => {
    const updateMany = vi.fn(async () => ({ count: 1 }));
    const database = {
      clipPublishingOutbox: { updateMany },
    } as unknown as PrismaClient;

    await nudgePrismaTikTokWebhookOutbox(database, ATTEMPT, NUDGED_AT);

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        availableAt: { gt: NUDGED_AT },
        eventType: "publishing.destination.requested",
        eventVersion: 1,
        postStateId: "state123",
        status: "PENDING",
        tenantId: "tenant123",
      },
      data: { availableAt: NUDGED_AT },
    });
  });

  it("validates the boundary before touching PostgreSQL", async () => {
    const updateMany = vi.fn(async () => ({ count: 0 }));
    const database = {
      clipPublishingOutbox: { updateMany },
    } as unknown as PrismaClient;

    await expect(
      nudgePrismaTikTokWebhookOutbox(
        database,
        { ...ATTEMPT, postStateId: "" },
        NUDGED_AT,
      ),
    ).rejects.toThrow();
    expect(updateMany).not.toHaveBeenCalled();
  });
});
