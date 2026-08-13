import { describe, expect, it, vi } from "vitest";

import type { LeasedPublishingOutboxRecord } from "../src/persistence/LeasedPublishingOutboxRecord.js";
import { derivePersonalTenantKey } from "../src/identity/derivePersonalTenantKey.js";
import type { PublishingProviderRuntime } from "../src/provider-runtime/registry/PublishingProviderRuntime.js";
import type { PublishingWorkflowPort } from "../src/workflow/PublishingWorkflowPort.js";
import type { PublishingWorkflowWorkItem } from "../src/workflow/PublishingWorkflowWorkItem.js";
import { createPublishingWorkflowHandler } from "../src/workflow/createPublishingWorkflowHandler.js";

const NOW = new Date("2026-08-02T04:00:00.000Z");
const record: LeasedPublishingOutboxRecord = {
  id: "outbox_1",
  tenantId: "tenant_1",
  postStateId: "state_1",
  workflowId: "workflow_1",
  eventType: "publishing.destination.requested",
  eventVersion: 1,
  payload: { schemaVersion: 1 },
  status: "LEASED",
  availableAt: NOW,
  leaseOwner: "worker_1",
  leaseExpiresAt: new Date("2026-08-02T04:02:00.000Z"),
  deliveryAttempts: 1,
  createdAt: NOW,
  updatedAt: NOW,
};

const createItem = (
  checkpoint: unknown,
  checkpointVersion = 0,
): PublishingWorkflowWorkItem => ({
  tenantKey: derivePersonalTenantKey("user_workflow"),
  ownerId: "user_workflow",
  productId: "product_workflow",
  postStateId: "state_1",
  attemptId: "attempt_1",
  attemptKey: "attempt_1",
  checkpointVersion,
  checkpoint,
  providerCallAllowed: true,
  alreadyPublished: false,
  terminal: false,
  provider: "tiktok",
  integrationId: "integration_1",
  accountId: "open_id_1",
  grantedScopes: ["video.publish", "video.upload"],
  caption: "Ready to publish",
  settings: {
    provider: "tiktok",
    mode: "direct",
    allowComment: true,
    allowDuet: false,
    allowStitch: false,
    autoAddMusic: false,
    brandContent: false,
    brandOrganic: false,
    consentConfirmed: true,
    creatorInfoFetchedAt: NOW.getTime(),
    isAigc: false,
    privacyLevel: "PUBLIC_TO_EVERYONE",
  },
  media: [
    {
      orderedIndex: 0,
      objectKey: "users/user_workflow/stitches/final.mp4",
      version: "etag:abc",
      checksum: "a".repeat(64),
      byteLength: 100,
      contentType: "video/mp4",
      durationSeconds: 12,
    },
  ],
  createdAtEpochMilliseconds: NOW.getTime(),
});

const createPort = (
  item: PublishingWorkflowWorkItem,
  events: string[],
): PublishingWorkflowPort => ({
  load: vi.fn(async () => item),
  readAccessToken: vi.fn(async () => "access-token"),
  resolveMediaGrants: vi.fn(async () => [
    {
      url: `https://media.clipstitchr.invalid/api/studio/publishing/media/${"a".repeat(80)}`,
      expiresAtEpochMilliseconds: NOW.getTime() + 4_200_000,
    },
  ]),
  writeCheckpoint: vi.fn(async ({ expectedVersion, checkpoint }) => {
    events.push(`checkpoint:${String(checkpoint["stage"])}`);
    return expectedVersion + 1;
  }),
  recordObservation: vi.fn(async ({ observation }) => {
    events.push(`observation:${observation.result.kind}`);
  }),
});

const creatorInfo = {
  fetchedAtEpochMilliseconds: NOW.getTime(),
  username: "creator",
  nickname: "Creator",
  privacyLevelOptions: ["PUBLIC_TO_EVERYONE"],
  commentsDisabled: false,
  duetDisabled: false,
  stitchDisabled: false,
  maxVideoDurationSeconds: 180,
};

describe("createPublishingWorkflowHandler", () => {
  it("turns a recovered dispatch-intent checkpoint into uncertain without another provider call", async () => {
    const events: string[] = [];
    const item = createItem(
      {
        schemaVersion: 1,
        stage: "tiktok-dispatch-intent",
        operationId: "operation_1",
      },
      1,
    );
    const port = createPort(item, events);
    const publish = vi.fn();
    const handler = createPublishingWorkflowHandler({
      authorizeDispatch: vi.fn(async () => true),
      port,
      providerRuntimes: new Map([
        ["tiktok", { id: "tiktok", publish } as unknown as PublishingProviderRuntime],
      ]),
      now: () => NOW,
    });

    await expect(
      handler(record, new AbortController().signal),
    ).resolves.toEqual({ kind: "complete" });
    expect(publish).not.toHaveBeenCalled();
    expect(port.readAccessToken).not.toHaveBeenCalled();
    expect(events).toEqual([
      "checkpoint:terminal",
      "observation:outcome_unknown",
    ]);
  });

  it("persists TikTok dispatch intent before the provider call and accepted state before observation", async () => {
    const events: string[] = [];
    const item = createItem({});
    const port = createPort(item, events);
    const runtime = {
      id: "tiktok" as const,
      getCreatorInfo: vi.fn(async () => creatorInfo),
      publish: vi.fn(async () => {
        events.push("provider:publish");
        return {
          provider: "tiktok" as const,
          kind: "accepted" as const,
          providerOperationId: "publish_1",
          remotePostIds: [],
          remoteUrls: [],
          visibility: "PUBLIC_TO_EVERYONE",
        };
      }),
    };
    const handler = createPublishingWorkflowHandler({
      authorizeDispatch: vi.fn(async () => true),
      port,
      providerRuntimes: new Map([
        ["tiktok", runtime as unknown as PublishingProviderRuntime],
      ]),
      now: () => NOW,
    });

    await expect(
      handler(record, new AbortController().signal),
    ).resolves.toMatchObject({
      kind: "retry",
      safeErrorCode: "provider_processing",
    });
    expect(events).toEqual([
      "checkpoint:tiktok-dispatch-intent",
      "provider:publish",
      "checkpoint:tiktok-processing",
      "observation:accepted",
    ]);
  });

  it("repeats only the idempotent status query when TikTok is processing", async () => {
    const events: string[] = [];
    const item = createItem(
      {
        schemaVersion: 1,
        stage: "tiktok-processing",
        publishId: "publish_1",
        pollCount: 2,
        acceptedAtEpochMilliseconds: NOW.getTime() - 10_000,
      },
      2,
    );
    const port = createPort(item, events);
    const runtime = {
      id: "tiktok" as const,
      getPostStatus: vi.fn(async () => {
        events.push("provider:status");
        return {
          provider: "tiktok" as const,
          kind: "published" as const,
          providerOperationId: "publish_1",
          remotePostIds: ["video_1"],
          remoteUrls: [],
          visibility: undefined,
        };
      }),
      publish: vi.fn(),
    };
    const handler = createPublishingWorkflowHandler({
      authorizeDispatch: vi.fn(async () => true),
      port,
      providerRuntimes: new Map([
        ["tiktok", runtime as unknown as PublishingProviderRuntime],
      ]),
      now: () => NOW,
    });

    await expect(
      handler(record, new AbortController().signal),
    ).resolves.toEqual({ kind: "complete" });
    expect(runtime.publish).not.toHaveBeenCalled();
    expect(port.resolveMediaGrants).not.toHaveBeenCalled();
    expect(events).toEqual([
      "provider:status",
      "checkpoint:terminal",
      "observation:published",
    ]);
  });

  it("dead-letters unrecognized outbox event versions before loading tenant data", async () => {
    const events: string[] = [];
    const item = createItem({});
    const port = createPort(item, events);
    const handler = createPublishingWorkflowHandler({
      authorizeDispatch: vi.fn(async () => true),
      port,
      providerRuntimes: new Map(),
    });

    await expect(
      handler(
        { ...record, eventVersion: 0 },
        new AbortController().signal,
      ),
    ).resolves.toEqual({
      kind: "dead-letter",
      safeErrorCode: "unsupported_event",
    });
    expect(port.load).not.toHaveBeenCalled();
  });

  it("reschedules a revoked Product before any provider-capable work", async () => {
    const events: string[] = [];
    const item = createItem({});
    const port = createPort(item, events);
    const publish = vi.fn();
    const authorizeDispatch = vi.fn(async () => false);
    const handler = createPublishingWorkflowHandler({
      authorizeDispatch,
      port,
      providerRuntimes: new Map([
        ["tiktok", { id: "tiktok", publish } as unknown as PublishingProviderRuntime],
      ]),
      now: () => NOW,
    });

    await expect(
      handler(record, new AbortController().signal),
    ).resolves.toEqual({
      kind: "retry",
      availableAt: new Date("2026-08-02T05:00:00.000Z"),
      safeErrorCode: "studio_access_denied",
    });
    expect(authorizeDispatch).toHaveBeenCalledWith(
      { ownerId: "user_workflow", productId: "product_workflow" },
      expect.any(AbortSignal),
    );
    expect(publish).not.toHaveBeenCalled();
    expect(port.readAccessToken).not.toHaveBeenCalled();
    expect(port.resolveMediaGrants).not.toHaveBeenCalled();
    expect(port.writeCheckpoint).not.toHaveBeenCalled();
  });

  it("fails closed when the dynamic access authority is unavailable", async () => {
    const events: string[] = [];
    const item = createItem({});
    const port = createPort(item, events);
    const publish = vi.fn();
    const handler = createPublishingWorkflowHandler({
      authorizeDispatch: vi.fn(async () => {
        throw new Error("temporary authority failure");
      }),
      port,
      providerRuntimes: new Map([
        ["tiktok", { id: "tiktok", publish } as unknown as PublishingProviderRuntime],
      ]),
      now: () => NOW,
    });

    await expect(
      handler(record, new AbortController().signal),
    ).resolves.toEqual({
      kind: "retry",
      availableAt: new Date("2026-08-02T04:01:00.000Z"),
      safeErrorCode: "studio_access_unavailable",
    });
    expect(publish).not.toHaveBeenCalled();
    expect(port.readAccessToken).not.toHaveBeenCalled();
  });
});
