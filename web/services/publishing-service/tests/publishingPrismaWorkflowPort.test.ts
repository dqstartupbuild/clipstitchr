import { createSecretKey } from "node:crypto";

import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import { PublishingCheckpointConflictError } from "../src/errors/PublishingCheckpointConflictError.js";
import { PublishingResourceOwnershipError } from "../src/errors/PublishingResourceOwnershipError.js";
import { derivePersonalTenantKey } from "../src/identity/derivePersonalTenantKey.js";
import type { PublishingIntegrationRuntime } from "../src/integrations/PublishingIntegrationRuntime.js";
import type { LeasedPublishingOutboxRecord } from "../src/persistence/LeasedPublishingOutboxRecord.js";
import type { RecordPublishingReceiptInput } from "../src/persistence/RecordPublishingReceiptInput.js";
import type { ProviderConnection } from "../src/provider-runtime/contracts/ProviderConnection.js";
import type { ProviderPublishResult } from "../src/provider-runtime/contracts/ProviderPublishResult.js";
import { ProviderRuntimeError } from "../src/provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingProvider } from "../src/providers/PublishingProvider.js";
import type { PublishingWorkflowWorkItem } from "../src/workflow/PublishingWorkflowWorkItem.js";
import type { PrismaPublishingDispatchRecord } from "../src/workflow-prisma/PrismaPublishingDispatchRecord.js";
import type { PrismaPublishingSafeIntegrationRecord } from "../src/workflow-prisma/PrismaPublishingSafeIntegrationRecord.js";
import type { PrismaPublishingWorkflowPersistence } from "../src/workflow-prisma/PrismaPublishingWorkflowPersistence.js";
import { createPrismaPublishingWorkflowPort } from "../src/workflow-prisma/createPrismaPublishingWorkflowPort.js";

const NOW = new Date("2026-08-02T12:00:00.000Z");
const TENANT_KEY = derivePersonalTenantKey("user_workflow_adapter");
const cipherKey = Object.freeze({
  id: "workflow-test-key",
  key: createSecretKey(Buffer.alloc(32, 7)),
  purpose: "provider-token-encryption" as const,
});
const keyring = new Map([[cipherKey.id, cipherKey]]);
const database = {} as PrismaClient;

const lease: LeasedPublishingOutboxRecord = Object.freeze({
  id: "outbox_1",
  tenantId: "tenant_db_1",
  postStateId: "state_1",
  workflowId: "workflow_1",
  eventType: "publishing.destination.requested",
  eventVersion: 1,
  payload: { schemaVersion: 1 },
  status: "LEASED",
  availableAt: NOW,
  leaseOwner: "worker_1",
  leaseExpiresAt: new Date(NOW.getTime() + 60_000),
  deliveryAttempts: 1,
  createdAt: NOW,
  updatedAt: NOW,
});

const safeIntegration = (
  provider: PublishingProvider,
  input: Partial<PrismaPublishingSafeIntegrationRecord> = {},
): PrismaPublishingSafeIntegrationRecord =>
  ({
    id: "integration_1",
    internalId: "account_1",
    organizationId: "organization_1",
    name: "Creator",
    picture: null,
    providerIdentifier: provider,
    type: provider,
    disabled: false,
    tokenExpiration: new Date(NOW.getTime() + 3_600_000),
    profile: null,
    createdAt: NOW,
    updatedAt: NOW,
    refreshNeeded: false,
    additionalSettings: JSON.stringify({
      schemaVersion: 1,
      grantedScopes: ["video.publish", "video.upload"],
      refreshCredentialExpiresAt: null,
    }),
    ...input,
  }) as PrismaPublishingSafeIntegrationRecord;

const dispatchRecord = (
  input: {
    provider?: PublishingProvider;
    settings?: string;
    tenantId?: string;
    manifest?: unknown;
    disposition?:
      | "ACTIVE"
      | "CANCELED"
      | "UNCERTAIN"
      | "ACTION_REQUIRED"
      | "TERMINAL";
    internalState?:
      | "DRAFT"
      | "QUEUED"
      | "DISPATCHING"
      | "PROCESSING"
      | "PUBLISHED"
      | "FAILED"
      | "CANCELED"
      | "ACTION_REQUIRED"
      | "UNCERTAIN";
    attemptStatus?:
      | "INTENT"
      | "STARTED"
      | "SUCCEEDED"
      | "FAILED"
      | "UNCERTAIN"
      | "CANCELED";
    receiptResult?: "PUBLISHED" | "REJECTED";
  } = {},
): PrismaPublishingDispatchRecord => {
  const provider = input.provider ?? "tiktok";
  const integration = safeIntegration(provider);
  const manifest = input.manifest ?? [
    {
      orderedIndex: 0,
      objectKey: "users/user_workflow_adapter/stitches/final.mp4",
      objectVersion: "etag:workflow-v1",
      checksum: "a".repeat(64),
      byteLength: 120,
      contentType: "video/mp4",
      durationSeconds: 12,
      width: 1080,
      height: 1920,
      videoCodec: "h264",
      audioCodec: "aac",
      hasAudio: true,
    },
  ];

  return {
    ...lease,
    tenantId: input.tenantId ?? lease.tenantId,
    postState: {
      id: lease.postStateId,
      tenantId: lease.tenantId,
      postId: "post_1",
      integrationId: integration.id,
      mediaSourceId: "media_source_1",
      workflowId: lease.workflowId,
      disposition: input.disposition ?? "ACTIVE",
      internalState: input.internalState ?? "QUEUED",
      createdAt: NOW,
      tenant: { tenantKey: TENANT_KEY },
      post: {
        id: "post_1",
        organizationId: integration.organizationId,
        integrationId: integration.id,
        state: "QUEUE",
        content: "A useful caption",
        settings:
          input.settings ??
          (provider === "tiktok"
            ? JSON.stringify({ mode: "inbox" })
            : JSON.stringify({ placement: "feed" })),
      },
      integration,
      mediaSource: {
        id: "media_source_1",
        tenantId: lease.tenantId,
        mediaId: "media_1",
        objectManifest: manifest,
        byteLength: 120n,
        media: {
          id: "media_1",
          organizationId: integration.organizationId,
        },
      },
      attempts: [
        {
          id: "attempt_1",
          tenantId: lease.tenantId,
          postStateId: lease.postStateId,
          attemptNumber: 1,
          status: input.attemptStatus ?? "STARTED",
          checkpointVersion: 2,
          checkpoint: { schemaVersion: 1, stage: "tiktok-ready" },
        },
      ],
      receipts:
        input.receiptResult === undefined
          ? []
          : [{ resultClass: input.receiptResult }],
    },
  } as unknown as PrismaPublishingDispatchRecord;
};

const workItem = (
  provider: PublishingProvider = "tiktok",
): PublishingWorkflowWorkItem =>
  Object.freeze({
    tenantKey: TENANT_KEY,
    postStateId: "state_1",
    attemptId: "attempt_1",
    attemptKey: "attempt_1",
    checkpointVersion: 2,
    checkpoint: {},
    providerCallAllowed: true,
    alreadyPublished: false,
    terminal: false,
    provider,
    integrationId: "integration_1",
    accountId: "account_1",
    grantedScopes: Object.freeze(["video.publish"]),
    caption: "A useful caption",
    settings:
      provider === "tiktok"
        ? Object.freeze({ provider: "tiktok", mode: "inbox" })
        : Object.freeze({ provider: "instagram", placement: "feed" }),
    media: Object.freeze([
      Object.freeze({
        orderedIndex: 0,
        objectKey: "users/user_workflow_adapter/stitches/final.mp4",
        version: "etag:workflow-v1",
        checksum: "a".repeat(64),
        byteLength: 120,
        contentType: "video/mp4" as const,
        durationSeconds: 12,
      }),
    ]),
    createdAtEpochMilliseconds: NOW.getTime(),
  });

const fakePersistence = (
  overrides: Partial<PrismaPublishingWorkflowPersistence> = {},
): PrismaPublishingWorkflowPersistence =>
  ({
    loadDestination: vi.fn(async () => dispatchRecord()),
    readIntegration: vi.fn(async () => safeIntegration("tiktok")),
    readSecret: vi.fn(async () => "current-access-token"),
    refreshConnection: vi.fn(async () => ({}) as never),
    writeCheckpoint: vi.fn(
      async (input) =>
        ({ checkpointVersion: input.expectedVersion + 1 }) as never,
    ),
    recordReceipt: vi.fn(async () => ({}) as never),
    ...overrides,
  }) as PrismaPublishingWorkflowPersistence;

const portWith = (
  persistence: PrismaPublishingWorkflowPersistence,
  providerRuntimes: ReadonlyMap<
    PublishingProvider,
    PublishingIntegrationRuntime
  > = new Map(),
) =>
  createPrismaPublishingWorkflowPort({
    database,
    keyring,
    cipherKey,
    providerRuntimes,
    resolveMediaGrants: vi.fn(async () => []),
    now: () => NOW,
    persistence,
  });

describe("createPrismaPublishingWorkflowPort", () => {
  it("loads the lease-owned tenant, strict settings, media, scopes, and latest checkpoint", async () => {
    const loadDestination = vi.fn(async () => dispatchRecord());
    const port = portWith(fakePersistence({ loadDestination }));

    await expect(port.load(lease)).resolves.toEqual(
      expect.objectContaining({
        tenantKey: TENANT_KEY,
        postStateId: "state_1",
        attemptId: "attempt_1",
        checkpointVersion: 2,
        checkpoint: { schemaVersion: 1, stage: "tiktok-ready" },
        provider: "tiktok",
        integrationId: "integration_1",
        accountId: "account_1",
        grantedScopes: ["video.publish", "video.upload"],
        settings: { provider: "tiktok", mode: "inbox" },
        media: [
          expect.objectContaining({
            objectKey: "users/user_workflow_adapter/stitches/final.mp4",
            version: "etag:workflow-v1",
            contentType: "video/mp4",
            durationSeconds: 12,
          }),
        ],
        providerCallAllowed: true,
        alreadyPublished: false,
        terminal: false,
      }),
    );
    expect(loadDestination).toHaveBeenCalledWith({
      outboxId: lease.id,
      leaseOwner: lease.leaseOwner,
      now: NOW,
    });
  });

  it("fails closed on tenant-shape mismatches and noncanonical settings or manifests", async () => {
    const tenantMismatch = portWith(
      fakePersistence({
        loadDestination: vi.fn(async () =>
          dispatchRecord({ tenantId: "tenant_db_other" }),
        ),
      }),
    );
    await expect(tenantMismatch.load(lease)).rejects.toBeInstanceOf(
      PublishingResourceOwnershipError,
    );

    const invalidSettings = portWith(
      fakePersistence({
        loadDestination: vi.fn(async () =>
          dispatchRecord({
            settings: JSON.stringify({ mode: "inbox", ignored: true }),
          }),
        ),
      }),
    );
    await expect(invalidSettings.load(lease)).rejects.toMatchObject({
      code: "invalid_request",
    });

    const invalidManifest = portWith(
      fakePersistence({
        loadDestination: vi.fn(async () =>
          dispatchRecord({
            manifest: [
              {
                orderedIndex: 0,
                objectKey: "https://signed.example/media.mp4?token=secret",
                objectVersion: "v1",
                checksum: "a".repeat(64),
                byteLength: 120,
                contentType: "video/mp4",
              },
            ],
          }),
        ),
      }),
    );
    await expect(invalidManifest.load(lease)).rejects.toMatchObject({
      code: "invalid_request",
    });
  });

  it("derives published, terminal, and provider-call state from persisted lifecycle facts", async () => {
    const published = portWith(
      fakePersistence({
        loadDestination: vi.fn(async () =>
          dispatchRecord({
            internalState: "PUBLISHED",
            disposition: "TERMINAL",
            attemptStatus: "SUCCEEDED",
            receiptResult: "PUBLISHED",
          }),
        ),
      }),
    );
    await expect(published.load(lease)).resolves.toEqual(
      expect.objectContaining({
        alreadyPublished: true,
        terminal: true,
        providerCallAllowed: false,
      }),
    );

    const actionRequired = portWith(
      fakePersistence({
        loadDestination: vi.fn(async () =>
          dispatchRecord({
            internalState: "ACTION_REQUIRED",
            disposition: "ACTION_REQUIRED",
          }),
        ),
      }),
    );
    await expect(actionRequired.load(lease)).resolves.toEqual(
      expect.objectContaining({
        alreadyPublished: false,
        terminal: true,
        providerCallAllowed: false,
      }),
    );
  });

  it("wires checkpoint compare-and-swap and rejects an impossible returned version", async () => {
    const writeCheckpoint = vi.fn(
      async (input) =>
        ({ checkpointVersion: input.expectedVersion + 1 }) as never,
    );
    const port = portWith(fakePersistence({ writeCheckpoint }));
    const item = workItem();

    await expect(
      port.writeCheckpoint({
        item,
        expectedVersion: 2,
        checkpoint: { schemaVersion: 1, stage: "tiktok-ready" },
        providerOperationKind: "tiktok-publish",
        providerOperationId: "publish_1",
        checkpointedAt: NOW,
      }),
    ).resolves.toBe(3);
    expect(writeCheckpoint).toHaveBeenCalledWith({
      tenantKey: TENANT_KEY,
      attemptId: "attempt_1",
      expectedVersion: 2,
      checkpoint: { schemaVersion: 1, stage: "tiktok-ready" },
      providerOperationKind: "tiktok-publish",
      providerOperationId: "publish_1",
      checkpointedAt: NOW,
    });

    const invalidVersion = portWith(
      fakePersistence({
        writeCheckpoint: vi.fn(async () => ({ checkpointVersion: 9 }) as never),
      }),
    );
    await expect(
      invalidVersion.writeCheckpoint({
        item,
        expectedVersion: 2,
        checkpoint: { schemaVersion: 1, stage: "tiktok-ready" },
        providerOperationKind: "tiktok-publish",
        providerOperationId: "publish_1",
        checkpointedAt: NOW,
      }),
    ).rejects.toBeInstanceOf(PublishingCheckpointConflictError);
  });

  it.each<readonly [ProviderPublishResult["kind"], string]>([
    ["accepted", "accepted-processing"],
    ["media_transfer_pending", "accepted-processing"],
    ["processing", "accepted-processing"],
    ["requires_user_action", "user-action-required"],
    ["published", "published"],
    ["published_not_public", "uncertain"],
    ["rejected", "rejected"],
    ["outcome_unknown", "uncertain"],
  ])("maps the %s observation to %s", async (kind, expectedResult) => {
    const recordReceipt = vi.fn(async () => ({}) as never);
    const port = portWith(fakePersistence({ recordReceipt }));
    const result: ProviderPublishResult = Object.freeze({
      provider: "tiktok",
      kind,
      providerOperationId: "publish_1",
      remotePostIds: kind === "published" ? ["video_1"] : [],
      remoteUrls: [],
      visibility: undefined,
    });

    await port.recordObservation({
      item: workItem(),
      observation: { result, observedAt: NOW },
    });

    expect(recordReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        result: expectedResult,
        remotePublications:
          kind === "published" ? [{ remotePublicationId: "video_1" }] : [],
      }),
    );
  });

  it("uses a stable canonical digest and persists only provider-observable URLs", async () => {
    const receiptInputs: RecordPublishingReceiptInput[] = [];
    const recordReceipt = vi.fn(async (input: RecordPublishingReceiptInput) => {
      receiptInputs.push(input);
      return {} as never;
    });
    const port = portWith(fakePersistence({ recordReceipt }));
    const result: ProviderPublishResult = Object.freeze({
      provider: "tiktok",
      kind: "published",
      providerOperationId: "publish_1",
      remotePostIds: Object.freeze(["video_b", "video_a", "video_a"]),
      remoteUrls: Object.freeze([
        "https://www.tiktok.com/@creator/video/video_b",
        "https://www.instagram.com/p/not-tiktok",
        "https://www.tiktok.com/@creator/video/video_a?token=secret",
      ]),
      visibility: "PUBLIC_TO_EVERYONE",
    });

    await port.recordObservation({
      item: workItem(),
      observation: { result, observedAt: NOW },
    });
    await port.recordObservation({
      item: workItem(),
      observation: {
        result,
        observedAt: new Date(NOW.getTime() + 5_000),
      },
    });

    const first = receiptInputs[0];
    const second = receiptInputs[1];
    expect(first?.responseDigest).toMatch(/^[a-f0-9]{64}$/u);
    expect(second?.responseDigest).toBe(first?.responseDigest);
    expect(first?.remotePublications).toEqual([
      { remotePublicationId: "video_a" },
      {
        remotePublicationId: "video_b",
        observableUrl: "https://www.tiktok.com/@creator/video/video_b",
      },
    ]);
    expect(first?.safeMetadata).toEqual({
      schemaVersion: 1,
      provider: "tiktok",
      providerResultKind: "published",
      providerOperationId: "publish_1",
      visibility: "PUBLIC_TO_EVERYONE",
      remotePostCount: 2,
      observableUrlCount: 1,
    });
  });

  it("fails auth-required when the current access credential is missing", async () => {
    const port = portWith(
      fakePersistence({
        readIntegration: vi.fn(async () => safeIntegration("tiktok")),
        readSecret: vi.fn(async () => null),
      }),
    );

    await expect(port.readAccessToken(workItem())).rejects.toMatchObject({
      code: "auth_required",
      provider: "tiktok",
    });
  });

  it("proactively refreshes standalone Instagram with the locked current access token", async () => {
    const refreshRuntime = vi.fn(
      async (credential: string): Promise<ProviderConnection> => ({
        provider: "instagram-standalone",
        accountId: "account_1",
        accountName: "Creator",
        username: "creator",
        pictureUrl: undefined,
        accessToken: "rotated-standalone-access",
        refreshToken: "rotated-standalone-access",
        expiresInSeconds: 5_184_000,
        refreshExpiresInSeconds: undefined,
        scopes: ["instagram_business_content_publish"],
      }),
    );
    const refreshConnection = vi.fn(async (input) => {
      await input.refreshConnection("locked-current-access");
      return {} as never;
    });
    const readSecret = vi.fn(async () => "rotated-standalone-access");
    const port = portWith(
      fakePersistence({
        readIntegration: vi.fn(async () =>
          safeIntegration("instagram-standalone", {
            tokenExpiration: new Date(NOW.getTime() + 60_000),
          }),
        ),
        refreshConnection,
        readSecret,
      }),
      new Map([
        [
          "instagram-standalone",
          {
            id: "instagram-standalone",
            refreshConnection: refreshRuntime,
          } as unknown as PublishingIntegrationRuntime,
        ],
      ]),
    );

    await expect(
      port.readAccessToken(workItem("instagram-standalone")),
    ).resolves.toBe("rotated-standalone-access");
    expect(refreshRuntime).toHaveBeenCalledWith("locked-current-access");
    expect(refreshConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantKey: TENANT_KEY,
        integrationId: "integration_1",
        provider: "instagram-standalone",
        credentialKind: "access",
      }),
    );
  });

  it("refreshes TikTok with the locked refresh credential when marked stale", async () => {
    const refreshRuntime = vi.fn(
      async (credential: string): Promise<ProviderConnection> => ({
        provider: "tiktok",
        accountId: "account_1",
        accountName: "Creator",
        username: "creator",
        pictureUrl: undefined,
        accessToken: "rotated-tiktok-access",
        refreshToken: "rotated-tiktok-refresh",
        expiresInSeconds: 86_400,
        refreshExpiresInSeconds: 31_536_000,
        scopes: ["video.publish"],
      }),
    );
    const refreshConnection = vi.fn(async (input) => {
      await input.refreshConnection("locked-current-refresh");
      return {} as never;
    });
    const port = portWith(
      fakePersistence({
        readIntegration: vi.fn(async () =>
          safeIntegration("tiktok", { refreshNeeded: true }),
        ),
        refreshConnection,
        readSecret: vi.fn(async () => "rotated-tiktok-access"),
      }),
      new Map([
        [
          "tiktok",
          {
            id: "tiktok",
            refreshConnection: refreshRuntime,
          } as unknown as PublishingIntegrationRuntime,
        ],
      ]),
    );

    await expect(port.readAccessToken(workItem("tiktok"))).resolves.toBe(
      "rotated-tiktok-access",
    );
    expect(refreshRuntime).toHaveBeenCalledWith("locked-current-refresh");
    expect(refreshConnection).toHaveBeenCalledWith(
      expect.objectContaining({ credentialKind: "refresh" }),
    );
  });

  it("maps a missing locked TikTok refresh credential to auth-required", async () => {
    const port = portWith(
      fakePersistence({
        readIntegration: vi.fn(async () =>
          safeIntegration("tiktok", { refreshNeeded: true }),
        ),
        refreshConnection: vi.fn(async () => {
          throw new PublishingResourceOwnershipError();
        }),
      }),
      new Map([
        [
          "tiktok",
          {
            id: "tiktok",
            refreshConnection: vi.fn(),
          } as unknown as PublishingIntegrationRuntime,
        ],
      ]),
    );

    await expect(
      port.readAccessToken(workItem("tiktok")),
    ).rejects.toMatchObject({
      code: "auth_required",
      provider: "tiktok",
    });
  });

  it("requires Facebook-backed Instagram reauthorization after access expiry", async () => {
    const refreshConnection = vi.fn(async () => ({}) as never);
    const readSecret = vi.fn(async () => "expired-access");
    const port = portWith(
      fakePersistence({
        readIntegration: vi.fn(async () =>
          safeIntegration("instagram", {
            tokenExpiration: new Date(NOW.getTime() - 1),
          }),
        ),
        refreshConnection,
        readSecret,
      }),
    );

    await expect(
      port.readAccessToken(workItem("instagram")),
    ).rejects.toBeInstanceOf(ProviderRuntimeError);
    await expect(
      port.readAccessToken(workItem("instagram")),
    ).rejects.toMatchObject({ code: "auth_required" });
    expect(refreshConnection).not.toHaveBeenCalled();
    expect(readSecret).not.toHaveBeenCalled();
  });
});
