import { createHash } from "node:crypto";

import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import { derivePersonalTenantKey } from "../src/identity/derivePersonalTenantKey.js";
import { resolvePrismaTikTokWebhookAttempt } from "../src/webhooks/resolvePrismaTikTokWebhookAttempt.js";

const TENANT_KEY = derivePersonalTenantKey("user_tiktok_webhook");
const ATTEMPT_RECORD = Object.freeze({
  id: "attempt123",
  postStateId: "state123",
  tenantId: "tenant123",
  tenant: Object.freeze({
    organizationId: "organization123",
    tenantKey: TENANT_KEY,
  }),
  postState: Object.freeze({
    integrationId: "integration123",
    tenantId: "tenant123",
    integration: Object.freeze({
      id: "integration123",
      organizationId: "organization123",
    }),
    post: Object.freeze({
      integrationId: "integration123",
      organizationId: "organization123",
    }),
  }),
});

describe("resolvePrismaTikTokWebhookAttempt", () => {
  it("resolves one active tenant-owned attempt by its safe publish reference", async () => {
    const findMany = vi.fn(async () => [ATTEMPT_RECORD]);
    const database = {
      clipPublishingAttempt: { findMany },
    } as unknown as PrismaClient;
    const publishId = "v_pub_url~v2.123456789";

    await expect(
      resolvePrismaTikTokWebhookAttempt(database, publishId),
    ).resolves.toEqual({
      attemptId: "attempt123",
      postStateId: "state123",
      tenantId: "tenant123",
      tenantKey: TENANT_KEY,
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        finishedAt: null,
        providerOperationId: `sha256:${createHash("sha256")
          .update(publishId, "utf8")
          .digest("hex")}`,
        providerOperationKind: "TIKTOK_PUBLISH",
        status: "STARTED",
        postState: {
          disposition: "ACTIVE",
          integration: {
            deletedAt: null,
            providerIdentifier: "tiktok",
          },
          internalState: { in: ["DISPATCHING", "PROCESSING"] },
        },
      },
      select: {
        id: true,
        postStateId: true,
        tenantId: true,
        tenant: {
          select: { organizationId: true, tenantKey: true },
        },
        postState: {
          select: {
            integrationId: true,
            tenantId: true,
            integration: { select: { id: true, organizationId: true } },
            post: {
              select: { integrationId: true, organizationId: true },
            },
          },
        },
      },
      take: 2,
    });
  });

  it("refuses an ambiguous publish ID", async () => {
    const findMany = vi.fn(async () => [
      ATTEMPT_RECORD,
      { ...ATTEMPT_RECORD, id: "attempt456" },
    ]);
    const database = {
      clipPublishingAttempt: { findMany },
    } as unknown as PrismaClient;

    await expect(
      resolvePrismaTikTokWebhookAttempt(database, "publish123"),
    ).resolves.toBeNull();
  });

  it("refuses cross-organization relational drift", async () => {
    const findMany = vi.fn(async () => [
      {
        ...ATTEMPT_RECORD,
        postState: {
          ...ATTEMPT_RECORD.postState,
          post: {
            ...ATTEMPT_RECORD.postState.post,
            organizationId: "organization456",
          },
        },
      },
    ]);
    const database = {
      clipPublishingAttempt: { findMany },
    } as unknown as PrismaClient;

    await expect(
      resolvePrismaTikTokWebhookAttempt(database, "publish123"),
    ).resolves.toBeNull();
  });
});
