import { Buffer } from "node:buffer";

import { PrismaClient } from "@prisma/client";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PublishingCheckpointConflictError } from "../../src/errors/PublishingCheckpointConflictError.js";
import { PublishingIdempotencyConflictError } from "../../src/errors/PublishingIdempotencyConflictError.js";
import { PublishingOutboxLeaseError } from "../../src/errors/PublishingOutboxLeaseError.js";
import { PublishingPersistenceValidationError } from "../../src/errors/PublishingPersistenceValidationError.js";
import { PublishingReceiptConflictError } from "../../src/errors/PublishingReceiptConflictError.js";
import { PublishingResourceOwnershipError } from "../../src/errors/PublishingResourceOwnershipError.js";
import { deriveOrganizationTenantKey } from "../../src/identity/deriveOrganizationTenantKey.js";
import { appendPublishingAnalyticsSnapshot } from "../../src/persistence/appendPublishingAnalyticsSnapshot.js";
import { appendPublishingAuditEvent } from "../../src/persistence/appendPublishingAuditEvent.js";
import { createPublishingDestination } from "../../src/persistence/createPublishingDestination.js";
import { createPublishingIntegration } from "../../src/persistence/createPublishingIntegration.js";
import { createPublishingMediaSource } from "../../src/persistence/createPublishingMediaSource.js";
import { disconnectPublishingIntegration } from "../../src/persistence/disconnectPublishingIntegration.js";
import { leasePublishingOutbox } from "../../src/persistence/leasePublishingOutbox.js";
import { listTenantAnalyticsSnapshots } from "../../src/persistence/listTenantAnalyticsSnapshots.js";
import { listTenantAttempts } from "../../src/persistence/listTenantAttempts.js";
import { listTenantAuditEvents } from "../../src/persistence/listTenantAuditEvents.js";
import { listTenantIntegrations } from "../../src/persistence/listTenantIntegrations.js";
import { listTenantMediaSources } from "../../src/persistence/listTenantMediaSources.js";
import { listTenantOutboxEvents } from "../../src/persistence/listTenantOutboxEvents.js";
import { listTenantPostStates } from "../../src/persistence/listTenantPostStates.js";
import { listTenantReceipts } from "../../src/persistence/listTenantReceipts.js";
import { managedIntegrationTokenMarker } from "../../src/persistence/managedIntegrationTokenMarker.js";
import { markPublishingOutboxDeadLetter } from "../../src/persistence/markPublishingOutboxDeadLetter.js";
import { markPublishingOutboxDelivered } from "../../src/persistence/markPublishingOutboxDelivered.js";
import { readPublishingAttemptForResume } from "../../src/persistence/readPublishingAttemptForResume.js";
import { readPublishingDestinationForDispatch } from "../../src/persistence/readPublishingDestinationForDispatch.js";
import { readPublishingIntegrationSecret } from "../../src/persistence/readPublishingIntegrationSecret.js";
import { readTenantPublishingIntegration } from "../../src/persistence/readTenantPublishingIntegration.js";
import { refreshPublishingProviderConnection } from "../../src/persistence/refreshPublishingProviderConnection.js";
import { recordPublishingReceipt } from "../../src/persistence/recordPublishingReceipt.js";
import { reschedulePublishingOutbox } from "../../src/persistence/reschedulePublishingOutbox.js";
import { resolveOrCreatePublishingTenant } from "../../src/persistence/resolveOrCreatePublishingTenant.js";
import { storePublishingIntegrationSecret } from "../../src/persistence/storePublishingIntegrationSecret.js";
import { upsertPublishingProviderConnection } from "../../src/persistence/upsertPublishingProviderConnection.js";
import { upsertPublishingProviderConnections } from "../../src/persistence/upsertPublishingProviderConnections.js";
import { writePublishingAttemptCheckpoint } from "../../src/persistence/writePublishingAttemptCheckpoint.js";
import { createProviderTokenCipherKey } from "../../src/tokens/createProviderTokenCipherKey.js";
import { createProviderTokenKeyring } from "../../src/tokens/createProviderTokenKeyring.js";
import { readEphemeralPostgresTestUrl } from "../support/readEphemeralPostgresTestUrl.js";
import { readPublishingSqlFile } from "../support/readPublishingSqlFile.js";

const tenantKeyA = deriveOrganizationTenantKey("org_alpha");
const tenantKeyB = deriveOrganizationTenantKey("org_bravo");
const checksumA = "a".repeat(64);
const checksumB = "b".repeat(64);
const revisionA = "c".repeat(64);
const revisionB = "d".repeat(64);
const databaseUrl = readEphemeralPostgresTestUrl(process.env);
const administrator = new Client({ connectionString: databaseUrl });
const database = new PrismaClient({ datasourceUrl: databaseUrl });

let tenantAId = "";
let tenantBId = "";
let organizationAId = "";
let organizationBId = "";
let integrationAId = "";
let integrationBId = "";
let mediaAId = "";
let mediaBId = "";
let mediaSourceAId = "";
let mediaSourceBId = "";
let postStateAId = "";
let postStateBId = "";
let attemptAId = "";
let attemptBId = "";
let workflowAId = "";
let receiptAId = "";
let receiptBId = "";

beforeAll(async () => {
  await administrator.connect();
  await administrator.query("DROP SCHEMA public CASCADE");
  await administrator.query("CREATE SCHEMA public");
  const coreSql = await readPublishingSqlFile(
    "../fixtures/focused-postiz-core.sql",
  );
  const baselineMigrationSql = await readPublishingSqlFile(
    "../../prisma/migrations/20260802080000_baseline_focused_postiz_core/migration.sql",
  );
  const sidecarMigrationSql = await readPublishingSqlFile(
    "../../prisma/migrations/20260802090000_add_clip_publishing_sidecars/migration.sql",
  );
  await administrator.query(coreSql);
  await administrator.query(baselineMigrationSql);
  await administrator.query(sidecarMigrationSql);
  await database.$connect();
});

afterAll(async () => {
  await database.$disconnect();
  await administrator.end();
});

describe.sequential("publishing PostgreSQL persistence", () => {
  it("creates immutable Clerk tenant mappings and isolates integrations and media", async () => {
    const [tenantA, duplicateTenantA, tenantB] = await Promise.all([
      resolveOrCreatePublishingTenant(database, {
        tenantKey: tenantKeyA,
        organizationName: "Alpha studio",
      }),
      resolveOrCreatePublishingTenant(database, {
        tenantKey: tenantKeyA,
        organizationName: "Alpha duplicate request",
      }),
      resolveOrCreatePublishingTenant(database, {
        tenantKey: tenantKeyB,
        organizationName: "Bravo studio",
      }),
    ]);
    tenantAId = tenantA.id;
    tenantBId = tenantB.id;
    organizationAId = tenantA.organizationId;
    organizationBId = tenantB.organizationId;

    expect(duplicateTenantA.id).toBe(tenantA.id);
    expect(
      await database.organization.count({
        where: { publishingTenant: { tenantKey: tenantKeyA } },
      }),
    ).toBe(1);

    const integrationA = await createPublishingIntegration(database, {
      tenantKey: tenantKeyA,
      internalId: "ig-alpha",
      name: "Alpha Instagram",
      provider: "instagram",
    });
    const integrationB = await createPublishingIntegration(database, {
      tenantKey: tenantKeyB,
      internalId: "tt-bravo",
      name: "Bravo TikTok",
      provider: "tiktok",
    });
    integrationAId = integrationA.id;
    integrationBId = integrationB.id;

    const mediaSourceA = await createPublishingMediaSource(database, {
      tenantKey: tenantKeyA,
      sourceKind: "swipe",
      sourceRecordId: "swipe-alpha",
      sourceRevision: revisionA,
      contentChecksum: checksumA,
      displayName: "Alpha launch carousel",
      mediaType: "image/webp",
      objects: [
        {
          orderedIndex: 0,
          objectKey: "publishing/alpha/revision-a/slide-0.webp",
          objectVersion: "alpha-version-0",
          checksum: checksumA,
          byteLength: 2_048,
          contentType: "image/webp",
          width: 1080,
          height: 1350,
          hasAudio: false,
        },
      ],
      compatibilityFacts: { width: 1080, height: 1350, slides: 1 },
    });
    const mediaSourceB = await createPublishingMediaSource(database, {
      tenantKey: tenantKeyB,
      sourceKind: "library",
      sourceRecordId: "video-bravo",
      sourceRevision: revisionB,
      contentChecksum: checksumB,
      displayName: "Bravo launch video",
      mediaType: "video/mp4",
      objects: [
        {
          orderedIndex: 0,
          objectKey: "publishing/bravo/revision-b/video.mp4",
          objectVersion: "bravo-version-0",
          checksum: checksumB,
          byteLength: 4_096,
          contentType: "video/mp4",
          durationSeconds: 8,
          width: 1080,
          height: 1920,
          videoCodec: "avc1.640028",
          audioCodec: "mp4a.40.2",
          hasAudio: true,
        },
      ],
      compatibilityFacts: { width: 1080, height: 1920, durationSeconds: 8 },
    });
    mediaAId = mediaSourceA.mediaId;
    mediaBId = mediaSourceB.mediaId;
    mediaSourceAId = mediaSourceA.id;
    mediaSourceBId = mediaSourceB.id;

    expect(mediaSourceB.objectManifest).toEqual([
      {
        orderedIndex: 0,
        objectKey: "publishing/bravo/revision-b/video.mp4",
        objectVersion: "bravo-version-0",
        checksum: checksumB,
        byteLength: 4_096,
        contentType: "video/mp4",
        durationSeconds: 8,
        width: 1080,
        height: 1920,
        videoCodec: "avc1.640028",
        audioCodec: "mp4a.40.2",
        hasAudio: true,
      },
    ]);

    expect(
      (await listTenantIntegrations(database, tenantKeyA)).map(({ id }) => id),
    ).toEqual([integrationAId]);
    expect(
      (await listTenantIntegrations(database, tenantKeyB)).map(({ id }) => id),
    ).toEqual([integrationBId]);
    expect(
      (await listTenantMediaSources(database, tenantKeyA)).map(({ id }) => id),
    ).toEqual([mediaSourceAId]);
    expect(
      (await listTenantMediaSources(database, tenantKeyB)).map(({ id }) => id),
    ).toEqual([mediaSourceBId]);
    expect(mediaSourceA.media.path).toBe(
      `clipstitchr-media-source:${mediaSourceAId}`,
    );
    expect(mediaSourceA.media.path).not.toMatch(/^(?:blob:|https?:)/u);

    await expect(
      createPublishingMediaSource(database, {
        tenantKey: tenantKeyA,
        sourceKind: "library",
        sourceRecordId: "bad-browser-object",
        sourceRevision: "e".repeat(64),
        contentChecksum: "f".repeat(64),
        displayName: "Bad browser object",
        mediaType: "video/mp4",
        objects: [
          {
            orderedIndex: 0,
            objectKey: "blob:https://clipstitchr.example/browser-only",
            objectVersion: "browser-version",
            checksum: "f".repeat(64),
            byteLength: 1_024,
            contentType: "video/mp4",
          },
        ],
        compatibilityFacts: {},
      }),
    ).rejects.toBeInstanceOf(PublishingPersistenceValidationError);
  });

  it("reconnects one integration safely and exposes only non-secret metadata", async () => {
    await database.integration.update({
      where: { id: integrationAId },
      data: {
        disabled: true,
        deletedAt: new Date("2026-08-02T10:00:00.000Z"),
        token: "legacy-token-must-be-replaced",
        refreshToken: "legacy-refresh-must-be-replaced",
      },
    });

    const reconnectInput = {
      tenantKey: tenantKeyA,
      internalId: "ig-alpha",
      name: "Alpha Instagram reconnected",
      provider: "instagram",
      pictureUrl: "https://cdn.example.com/profiles/alpha.webp",
      username: "alpha.studio",
      grantedScopes: ["instagram_basic", "instagram_content_publish"],
      accessTokenExpiresAt: new Date("2026-10-01T00:00:00.000Z"),
      refreshTokenExpiresAt: new Date("2027-01-01T00:00:00.000Z"),
    } as const;
    const reconnects = await Promise.all(
      Array.from({ length: 8 }, () =>
        createPublishingIntegration(database, reconnectInput),
      ),
    );
    const stored = await database.integration.findUniqueOrThrow({
      where: { id: integrationAId },
    });
    const listed = await listTenantIntegrations(database, tenantKeyA);
    const listedIntegration = listed[0];

    expect(new Set(reconnects.map(({ id }) => id))).toEqual(
      new Set([integrationAId]),
    );
    expect(
      await database.integration.count({
        where: {
          organizationId: organizationAId,
          internalId: "ig-alpha",
        },
      }),
    ).toBe(1);
    expect(stored).toMatchObject({
      disabled: false,
      deletedAt: null,
      token: managedIntegrationTokenMarker,
      refreshToken: null,
      picture: reconnectInput.pictureUrl,
      tokenExpiration: reconnectInput.accessTokenExpiresAt,
    });
    expect(JSON.parse(stored.profile ?? "null")).toEqual({
      schemaVersion: 1,
      username: "alpha.studio",
    });
    expect(JSON.parse(stored.additionalSettings ?? "null")).toEqual({
      schemaVersion: 1,
      grantedScopes: ["instagram_basic", "instagram_content_publish"],
      refreshCredentialExpiresAt: "2027-01-01T00:00:00.000Z",
    });
    expect(listedIntegration).toBeDefined();
    expect(listedIntegration).not.toHaveProperty("token");
    expect(listedIntegration).not.toHaveProperty("refreshToken");
    expect(JSON.stringify(listed)).not.toContain(managedIntegrationTokenMarker);
    expect(JSON.stringify(listed)).not.toContain(
      "legacy-token-must-be-replaced",
    );

    await expect(
      createPublishingIntegration(database, {
        ...reconnectInput,
        provider: "tiktok",
      }),
    ).rejects.toBeInstanceOf(PublishingResourceOwnershipError);
  });

  it("persists only context-bound encrypted provider tokens", async () => {
    const cipherKey = createProviderTokenCipherKey(
      "provider-key-1",
      Buffer.alloc(32, 7).toString("base64"),
    );
    const keyring = createProviderTokenKeyring([cipherKey]);
    const plaintextToken = "provider-access-token-that-must-not-be-stored";
    const expiresAt = new Date("2026-10-01T00:00:00.000Z");
    const secret = await storePublishingIntegrationSecret(database, {
      tenantKey: tenantKeyA,
      integrationId: integrationAId,
      provider: "instagram",
      tokenKind: "access",
      plaintextToken,
      cipherKey,
      expiresAt,
    });
    const integration = await database.integration.findUniqueOrThrow({
      where: { id: integrationAId },
    });

    expect(secret.envelope).not.toContain(plaintextToken);
    expect(secret.expiresAt).toEqual(expiresAt);
    expect(integration.token).toBe(managedIntegrationTokenMarker);
    expect(integration.refreshToken).toBeNull();
    expect(
      await readPublishingIntegrationSecret(database, {
        tenantKey: tenantKeyA,
        integrationId: integrationAId,
        provider: "instagram",
        tokenKind: "access",
        keyring,
      }),
    ).toBe(plaintextToken);

    const rotatedTokens = Array.from(
      { length: 8 },
      (_, index) => `rotated-provider-token-${index + 1}`,
    );
    await Promise.all(
      rotatedTokens.map((rotatedToken) =>
        storePublishingIntegrationSecret(database, {
          tenantKey: tenantKeyA,
          integrationId: integrationAId,
          provider: "instagram",
          tokenKind: "access",
          plaintextToken: rotatedToken,
          cipherKey,
          expiresAt,
        }),
      ),
    );
    const versions = await database.clipPublishingIntegrationSecret.findMany({
      where: {
        tenantId: tenantAId,
        integrationId: integrationAId,
        tokenKind: "ACCESS",
      },
      orderBy: { version: "asc" },
    });
    const activeToken = await readPublishingIntegrationSecret(database, {
      tenantKey: tenantKeyA,
      integrationId: integrationAId,
      provider: "instagram",
      tokenKind: "access",
      keyring,
    });

    expect(versions.map(({ version }) => version)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
    expect(
      versions.filter(({ replacedAt }) => replacedAt === null),
    ).toHaveLength(1);
    expect(rotatedTokens).toContain(activeToken);
    for (const version of versions) {
      expect(version.envelope).not.toContain(plaintextToken);
      for (const rotatedToken of rotatedTokens) {
        expect(version.envelope).not.toContain(rotatedToken);
      }
    }
    await expect(
      readPublishingIntegrationSecret(database, {
        tenantKey: tenantKeyB,
        integrationId: integrationAId,
        provider: "instagram",
        tokenKind: "access",
        keyring,
      }),
    ).rejects.toBeInstanceOf(PublishingResourceOwnershipError);
    await expect(
      storePublishingIntegrationSecret(database, {
        tenantKey: tenantKeyA,
        integrationId: integrationAId,
        provider: "tiktok",
        tokenKind: "access",
        plaintextToken,
        cipherKey,
      }),
    ).rejects.toBeInstanceOf(PublishingResourceOwnershipError);
  });

  it("atomically persists an OAuth connection and preserves an omitted refresh credential", async () => {
    const cipherKey = createProviderTokenCipherKey(
      "provider-key-atomic",
      Buffer.alloc(32, 9).toString("base64"),
    );
    const keyring = createProviderTokenKeyring([cipherKey]);
    const firstConnectedAt = new Date("2026-08-02T13:00:00.000Z");
    const first = await upsertPublishingProviderConnection(database, {
      tenantKey: tenantKeyB,
      cipherKey,
      connectedAt: firstConnectedAt,
      connection: {
        provider: "tiktok",
        accountId: "tt-atomic",
        accountName: "Atomic TikTok",
        username: "atomic.tiktok",
        pictureUrl: "https://cdn.example.com/profiles/atomic.webp",
        accessToken: "atomic-access-v1",
        refreshToken: "atomic-refresh-v1",
        expiresInSeconds: 3_600,
        refreshExpiresInSeconds: 86_400,
        scopes: ["user.info.basic", "video.publish"],
      },
    });
    const firstRefresh = first.refreshSecret;

    expect(firstRefresh).not.toBeNull();
    expect(first.integration).not.toHaveProperty("token");
    expect(
      await database.integration.findUniqueOrThrow({
        where: { id: first.integration.id },
      }),
    ).toMatchObject({
      token: managedIntegrationTokenMarker,
      refreshToken: null,
      tokenExpiration: new Date("2026-08-02T14:00:00.000Z"),
    });
    expect(first.accessSecret.expiresAt).toEqual(
      new Date("2026-08-02T14:00:00.000Z"),
    );
    expect(firstRefresh?.expiresAt).toEqual(
      new Date("2026-08-03T13:00:00.000Z"),
    );

    const secondConnectedAt = new Date("2026-08-02T13:30:00.000Z");
    const second = await upsertPublishingProviderConnection(database, {
      tenantKey: tenantKeyB,
      cipherKey,
      connectedAt: secondConnectedAt,
      connection: {
        provider: "tiktok",
        accountId: "tt-atomic",
        accountName: "Atomic TikTok refreshed",
        username: undefined,
        pictureUrl: undefined,
        accessToken: "atomic-access-v2",
        refreshToken: undefined,
        expiresInSeconds: 7_200,
        refreshExpiresInSeconds: undefined,
        scopes: ["user.info.basic", "video.publish"],
      },
    });
    const activeRefresh =
      await database.clipPublishingIntegrationSecret.findFirstOrThrow({
        where: {
          integrationId: second.integration.id,
          tokenKind: "REFRESH",
          replacedAt: null,
        },
      });

    expect(second.refreshSecret).toBeNull();
    expect(activeRefresh.id).toBe(firstRefresh?.id);
    expect(
      await readPublishingIntegrationSecret(database, {
        tenantKey: tenantKeyB,
        integrationId: second.integration.id,
        provider: "tiktok",
        tokenKind: "refresh",
        keyring,
      }),
    ).toBe("atomic-refresh-v1");
    expect(JSON.parse(second.integration.additionalSettings ?? "null")).toEqual(
      {
        schemaVersion: 1,
        grantedScopes: ["user.info.basic", "video.publish"],
        refreshCredentialExpiresAt: "2026-08-03T13:00:00.000Z",
      },
    );

    const observedRefreshCredentials: string[] = [];
    const refreshConnection = async (credential: string) => {
      observedRefreshCredentials.push(credential);

      return {
        provider: "tiktok" as const,
        accountId: "tt-atomic",
        accountName: "Atomic TikTok scheduler refresh",
        username: undefined,
        pictureUrl: undefined,
        accessToken: `access-for-${credential}`,
        refreshToken: `${credential}-next`,
        expiresInSeconds: 3_600,
        refreshExpiresInSeconds: 86_400,
        scopes: ["user.info.basic", "video.publish"],
      };
    };
    await Promise.all([
      refreshPublishingProviderConnection(database, {
        tenantKey: tenantKeyB,
        integrationId: second.integration.id,
        provider: "tiktok",
        credentialKind: "refresh",
        keyring,
        cipherKey,
        refreshConnection,
        refreshedAt: new Date("2026-08-02T13:45:00.000Z"),
      }),
      refreshPublishingProviderConnection(database, {
        tenantKey: tenantKeyB,
        integrationId: second.integration.id,
        provider: "tiktok",
        credentialKind: "refresh",
        keyring,
        cipherKey,
        refreshConnection,
        refreshedAt: new Date("2026-08-02T13:45:00.000Z"),
      }),
    ]);

    expect(observedRefreshCredentials).toEqual([
      "atomic-refresh-v1",
      "atomic-refresh-v1-next",
    ]);
    expect(
      await readPublishingIntegrationSecret(database, {
        tenantKey: tenantKeyB,
        integrationId: second.integration.id,
        provider: "tiktok",
        tokenKind: "refresh",
        keyring,
      }),
    ).toBe("atomic-refresh-v1-next-next");

    await upsertPublishingProviderConnection(database, {
      tenantKey: tenantKeyB,
      cipherKey,
      connectedAt: new Date("2026-08-02T14:00:00.000Z"),
      missingRefreshTokenPolicy: "revoke",
      connection: {
        provider: "tiktok",
        accountId: "tt-atomic",
        accountName: "Atomic TikTok revoked",
        username: undefined,
        pictureUrl: undefined,
        accessToken: "atomic-access-v3",
        refreshToken: undefined,
        expiresInSeconds: 7_200,
        refreshExpiresInSeconds: undefined,
        scopes: ["user.info.basic", "video.publish"],
      },
    });
    expect(
      await database.clipPublishingIntegrationSecret.count({
        where: {
          integrationId: second.integration.id,
          tokenKind: "REFRESH",
          replacedAt: null,
        },
      }),
    ).toBe(0);

    expect(
      await readTenantPublishingIntegration(database, {
        tenantKey: tenantKeyB,
        integrationId: second.integration.id,
        provider: "tiktok",
      }),
    ).not.toHaveProperty("token");
    await disconnectPublishingIntegration(database, {
      tenantKey: tenantKeyB,
      integrationId: second.integration.id,
      provider: "tiktok",
      actorClerkUserId: "user_bravo",
      requestId: "disconnect_atomic_tiktok",
      disconnectedAt: new Date("2026-08-02T14:30:00.000Z"),
    });
    await expect(
      readTenantPublishingIntegration(database, {
        tenantKey: tenantKeyB,
        integrationId: second.integration.id,
        provider: "tiktok",
      }),
    ).rejects.toBeInstanceOf(PublishingResourceOwnershipError);
    expect(
      await database.clipPublishingIntegrationSecret.count({
        where: {
          integrationId: second.integration.id,
          replacedAt: null,
        },
      }),
    ).toBe(0);
  });

  it("commits every discovered Instagram account or rolls the whole batch back", async () => {
    const cipherKey = createProviderTokenCipherKey(
      "provider-key-batch",
      Buffer.alloc(32, 11).toString("base64"),
    );
    const connections = [
      {
        provider: "instagram" as const,
        accountId: "ig-batch-one",
        accountName: "Batch Instagram One",
        username: "batch.one",
        pictureUrl: undefined,
        accessToken: "batch-access-one",
        refreshToken: undefined,
        expiresInSeconds: 3_600,
        refreshExpiresInSeconds: undefined,
        scopes: ["instagram_basic", "instagram_content_publish"],
      },
      {
        provider: "instagram" as const,
        accountId: "ig-batch-two",
        accountName: "Batch Instagram Two",
        username: "batch.two",
        pictureUrl: undefined,
        accessToken: "batch-access-two",
        refreshToken: undefined,
        expiresInSeconds: 3_600,
        refreshExpiresInSeconds: undefined,
        scopes: ["instagram_basic", "instagram_content_publish"],
      },
    ] as const;
    const results = await upsertPublishingProviderConnections(database, {
      tenantKey: tenantKeyA,
      connections,
      cipherKey,
      connectedAt: new Date("2026-08-02T15:00:00.000Z"),
    });

    expect(results).toHaveLength(2);
    expect(
      await database.integration.count({
        where: {
          organizationId: organizationAId,
          internalId: { in: ["ig-batch-one", "ig-batch-two"] },
        },
      }),
    ).toBe(2);
    expect(
      await database.clipPublishingIntegrationSecret.count({
        where: {
          integrationId: {
            in: results.map(({ integration }) => integration.id),
          },
          tokenKind: "ACCESS",
          replacedAt: null,
        },
      }),
    ).toBe(2);

    await createPublishingIntegration(database, {
      tenantKey: tenantKeyA,
      internalId: "ig-batch-conflict",
      name: "Provider conflict",
      provider: "tiktok",
    });
    await expect(
      upsertPublishingProviderConnections(database, {
        tenantKey: tenantKeyA,
        connections: [
          {
            ...connections[0],
            accountId: "ig-batch-must-rollback",
          },
          {
            ...connections[1],
            accountId: "ig-batch-conflict",
          },
        ],
        cipherKey,
        connectedAt: new Date("2026-08-02T15:30:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(PublishingResourceOwnershipError);
    expect(
      await database.integration.count({
        where: {
          organizationId: organizationAId,
          internalId: "ig-batch-must-rollback",
        },
      }),
    ).toBe(0);
  });

  it("commits one post, state, attempt, and outbox under concurrent idempotent requests", async () => {
    const input = {
      tenantKey: tenantKeyA,
      integrationId: integrationAId,
      mediaSourceId: mediaSourceAId,
      idempotencyKey: "alpha-launch-request",
      actorClerkUserId: "user_alpha",
      requestId: "request_alpha",
      content: "Alpha launch",
      destinationSettings: {
        placement: "feed",
        consent: { termsAccepted: true },
      },
      intent: {
        kind: "schedule",
        schedule: {
          localDateTime: "2026-08-03T10:00:00",
          timeZone: "America/Detroit",
          utcOffsetMinutes: -240,
        },
      },
      group: "composer-alpha",
    } as const;
    const results = await Promise.all(
      Array.from({ length: 8 }, () =>
        createPublishingDestination(
          database,
          input,
          new Date("2026-08-02T12:00:00.000Z"),
        ),
      ),
    );
    const first = results[0];

    expect(first).toBeDefined();
    if (first === undefined) {
      throw new Error("Concurrent destination creation returned no result.");
    }
    expect(new Set(results.map(({ postId }) => postId)).size).toBe(1);
    expect(results.filter(({ created }) => created)).toHaveLength(1);
    postStateAId = first.postStateId;
    if (first.attemptId === null) {
      throw new Error("Scheduled destination did not create an attempt.");
    }
    attemptAId = first.attemptId;
    workflowAId = first.workflowId;
    expect(first.publishDate.toISOString()).toBe("2026-08-03T14:00:00.000Z");
    expect(first).toMatchObject({
      intent: "schedule",
      scheduledTimeZone: "America/Detroit",
      scheduledLocalTime: "2026-08-03T10:00:00",
      scheduledUtcOffsetMinutes: -240,
    });
    expect(await database.post.count({ where: { id: first.postId } })).toBe(1);
    expect(
      JSON.parse(
        (await database.post.findUniqueOrThrow({ where: { id: first.postId } }))
          .settings ?? "null",
      ),
    ).toEqual(input.destinationSettings);
    expect(
      await database.clipPublishingPostState.count({
        where: { id: postStateAId },
      }),
    ).toBe(1);
    expect(
      await database.clipPublishingOutbox.count({
        where: { postStateId: postStateAId },
      }),
    ).toBe(1);

    await expect(
      createPublishingDestination(
        database,
        {
          ...input,
          intent: {
            kind: "schedule",
            schedule: {
              ...input.intent.schedule,
              localDateTime: "2026-08-03T10:15:00",
            },
          },
        },
        new Date("2026-08-02T12:00:00.000Z"),
      ),
    ).rejects.toBeInstanceOf(PublishingIdempotencyConflictError);
    await expect(
      createPublishingDestination(
        database,
        {
          ...input,
          destinationSettings: {
            ...input.destinationSettings,
            placement: "reels",
          },
        },
        new Date("2026-08-02T12:00:00.000Z"),
      ),
    ).rejects.toBeInstanceOf(PublishingIdempotencyConflictError);

    const destinationB = await createPublishingDestination(
      database,
      {
        tenantKey: tenantKeyB,
        integrationId: integrationBId,
        mediaSourceId: mediaSourceBId,
        idempotencyKey: "alpha-launch-request",
        actorClerkUserId: "user_bravo",
        requestId: "request_bravo",
        content: "Bravo launch",
        destinationSettings: {
          mode: "direct-post",
          privacyLevel: "SELF_ONLY",
          allowComment: true,
          allowDuet: false,
          allowStitch: false,
          discloseAigc: false,
          brandedContent: false,
          consent: { musicUsageConfirmed: true },
          creatorInfoRevision: "creator-info-bravo-v1",
        },
        intent: {
          kind: "schedule",
          schedule: {
            localDateTime: "2026-08-03T11:00:00",
            timeZone: "America/Detroit",
            utcOffsetMinutes: -240,
          },
        },
        group: "composer-bravo",
      },
      new Date("2026-08-02T12:00:00.000Z"),
    );
    postStateBId = destinationB.postStateId;
    if (destinationB.attemptId === null) {
      throw new Error("Scheduled destination did not create an attempt.");
    }
    attemptBId = destinationB.attemptId;

    expect(
      (await listTenantPostStates(database, tenantKeyA)).map(({ id }) => id),
    ).toEqual([postStateAId]);
    expect(
      (await listTenantPostStates(database, tenantKeyB)).map(({ id }) => id),
    ).toEqual([postStateBId]);
    expect(
      (await listTenantAttempts(database, tenantKeyA)).map(({ id }) => id),
    ).toEqual([attemptAId]);
    expect(
      (await listTenantAttempts(database, tenantKeyB)).map(({ id }) => id),
    ).toEqual([attemptBId]);

    await expect(
      createPublishingDestination(
        database,
        {
          ...input,
          idempotencyKey: "cross-tenant-media",
          mediaSourceId: mediaSourceBId,
        },
        new Date("2026-08-02T12:00:00.000Z"),
      ),
    ).rejects.toBeInstanceOf(PublishingResourceOwnershipError);
  });

  it("leases expired outbox work for deterministic workflow recovery", async () => {
    expect(
      await leasePublishingOutbox(database, {
        leaseOwner: "dispatcher-before-due",
        now: new Date("2026-08-03T13:59:59.000Z"),
        leaseDurationMilliseconds: 60_000,
        limit: 100,
      }),
    ).toHaveLength(0);

    const firstNow = new Date("2026-08-03T14:00:00.000Z");
    const firstLeases = await leasePublishingOutbox(database, {
      leaseOwner: "dispatcher-one",
      now: firstNow,
      leaseDurationMilliseconds: 60_000,
      limit: 100,
    });

    expect(firstLeases).toHaveLength(1);
    expect(firstLeases.map(({ deliveryAttempts }) => deliveryAttempts)).toEqual(
      [1],
    );
    const leasedDestination = await readPublishingDestinationForDispatch(
      database,
      {
        outboxId: firstLeases[0]?.id ?? "missing",
        leaseOwner: "dispatcher-one",
        now: firstNow,
      },
    );

    expect(
      JSON.parse(leasedDestination.postState.post.settings ?? "null"),
    ).toEqual({ placement: "feed", consent: { termsAccepted: true } });
    expect(leasedDestination.postState.tenant.tenantKey).toBe(tenantKeyA);
    expect(leasedDestination.postState.mediaSource?.objectManifest).toEqual([
      expect.objectContaining({
        contentType: "image/webp",
        width: 1080,
        height: 1350,
        hasAudio: false,
      }),
    ]);
    expect(leasedDestination.postState.integration).not.toHaveProperty("token");
    expect(
      await leasePublishingOutbox(database, {
        leaseOwner: "dispatcher-two",
        now: new Date(firstNow.getTime() + 30_000),
        leaseDurationMilliseconds: 60_000,
        limit: 100,
      }),
    ).toHaveLength(0);

    const recovered = await leasePublishingOutbox(database, {
      leaseOwner: "dispatcher-two",
      now: new Date(firstNow.getTime() + 61_000),
      leaseDurationMilliseconds: 60_000,
      limit: 100,
    });
    expect(new Set(recovered.map(({ id }) => id))).toEqual(
      new Set(firstLeases.map(({ id }) => id)),
    );
    expect(recovered.map(({ deliveryAttempts }) => deliveryAttempts)).toEqual([
      2,
    ]);
    expect(recovered.some(({ workflowId }) => workflowId === workflowAId)).toBe(
      true,
    );

    const delivered = recovered[0];
    expect(delivered).toBeDefined();
    await expect(
      markPublishingOutboxDelivered(database, {
        outboxId: delivered?.id ?? "missing",
        leaseOwner: "dispatcher-one",
        deliveredAt: new Date(firstNow.getTime() + 62_000),
      }),
    ).rejects.toBeInstanceOf(PublishingOutboxLeaseError);
    await markPublishingOutboxDelivered(database, {
      outboxId: delivered?.id ?? "missing",
      leaseOwner: "dispatcher-two",
      deliveredAt: new Date(firstNow.getTime() + 62_000),
    });

    const secondDestination = await leasePublishingOutbox(database, {
      leaseOwner: "dispatcher-two",
      now: new Date("2026-08-03T15:00:00.000Z"),
      leaseDurationMilliseconds: 60_000,
      limit: 100,
    });
    expect(secondDestination).toHaveLength(1);
    expect(secondDestination[0]?.postStateId).toBe(postStateBId);

    expect(
      (await listTenantOutboxEvents(database, tenantKeyA)).every(
        ({ tenantId }) => tenantId === tenantAId,
      ),
    ).toBe(true);
    expect(
      (await listTenantOutboxEvents(database, tenantKeyB)).every(
        ({ tenantId }) => tenantId === tenantBId,
      ),
    ).toBe(true);
  });

  it("persists draft, publish-now, and exact schedule intents distinctly", async () => {
    const now = new Date("2026-08-04T12:00:00.000Z");
    const draft = await createPublishingDestination(
      database,
      {
        tenantKey: tenantKeyA,
        integrationId: integrationAId,
        mediaSourceId: mediaSourceAId,
        idempotencyKey: "alpha-draft-request",
        actorClerkUserId: "user_alpha",
        requestId: "request_alpha_draft",
        content: "Alpha draft",
        destinationSettings: { placement: "feed" },
        intent: { kind: "draft" },
        group: "composer-alpha-draft",
      },
      now,
    );
    const publishNow = await createPublishingDestination(
      database,
      {
        tenantKey: tenantKeyA,
        integrationId: integrationAId,
        mediaSourceId: mediaSourceAId,
        idempotencyKey: "alpha-publish-now-request",
        actorClerkUserId: "user_alpha",
        requestId: "request_alpha_publish_now",
        content: "Alpha publish now",
        destinationSettings: { placement: "reels" },
        intent: { kind: "publish-now" },
        group: "composer-alpha-publish-now",
      },
      now,
    );
    const [draftPost, draftState, publishNowOutbox] = await Promise.all([
      database.post.findUniqueOrThrow({ where: { id: draft.postId } }),
      database.clipPublishingPostState.findUniqueOrThrow({
        where: { id: draft.postStateId },
      }),
      database.clipPublishingOutbox.findFirstOrThrow({
        where: { postStateId: publishNow.postStateId },
      }),
    ]);

    expect(draft).toMatchObject({
      intent: "draft",
      attemptId: null,
      outboxId: null,
      scheduledTimeZone: null,
      scheduledLocalTime: null,
      scheduledUtcOffsetMinutes: null,
    });
    expect(draftPost.state).toBe("DRAFT");
    expect(draftState).toMatchObject({
      intent: "DRAFT",
      internalState: "DRAFT",
    });
    expect(
      await database.clipPublishingAttempt.count({
        where: { postStateId: draft.postStateId },
      }),
    ).toBe(0);
    expect(
      await database.clipPublishingOutbox.count({
        where: { postStateId: draft.postStateId },
      }),
    ).toBe(0);
    expect(publishNow).toMatchObject({
      intent: "publish-now",
      publishDate: now,
      scheduledTimeZone: null,
      scheduledLocalTime: null,
      scheduledUtcOffsetMinutes: null,
    });
    expect(publishNow.attemptId).not.toBeNull();
    expect(publishNow.outboxId).not.toBeNull();
    expect(publishNowOutbox.availableAt).toEqual(now);

    const firstDispatch = await leasePublishingOutbox(database, {
      leaseOwner: "intent-dispatcher",
      now,
      leaseDurationMilliseconds: 60_000,
      limit: 100,
    });
    const publishNowLease = firstDispatch.find(
      ({ id }) => id === publishNow.outboxId,
    );
    expect(publishNowLease).toBeDefined();
    await reschedulePublishingOutbox(database, {
      outboxId: publishNowLease?.id ?? "missing",
      leaseOwner: "intent-dispatcher",
      availableAt: new Date(now.getTime() + 300_000),
      safeErrorCode: "provider_rate_limited",
      rescheduledAt: now,
    });

    const retryDispatch = await leasePublishingOutbox(database, {
      leaseOwner: "intent-retry-dispatcher",
      now: new Date(now.getTime() + 300_000),
      leaseDurationMilliseconds: 60_000,
      limit: 100,
    });
    const retryLease = retryDispatch.find(
      ({ id }) => id === publishNow.outboxId,
    );
    expect(retryLease?.deliveryAttempts).toBe(2);
    await markPublishingOutboxDeadLetter(database, {
      outboxId: retryLease?.id ?? "missing",
      leaseOwner: "intent-retry-dispatcher",
      safeErrorCode: "delivery_attempts_exhausted",
      deadLetteredAt: new Date(now.getTime() + 300_001),
    });
    expect(
      await database.clipPublishingOutbox.findUniqueOrThrow({
        where: { id: publishNow.outboxId ?? "missing" },
      }),
    ).toMatchObject({
      status: "DEAD_LETTER",
      leaseOwner: null,
      leaseExpiresAt: null,
      lastSafeError: "delivery_attempts_exhausted",
    });

    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingAttempt" (
          "id", "tenantId", "postStateId", "attemptNumber",
          "actorClerkUserId", "updatedAt"
        ) VALUES ($1, $2, $3, 1, $4, CURRENT_TIMESTAMP)`,
        ["draft-attempt", tenantAId, draft.postStateId, "user_alpha"],
      ),
    ).rejects.toThrow();
  });

  it("resumes from durable provider protocol checkpoints instead of reinitializing", async () => {
    const checkpointed = await writePublishingAttemptCheckpoint(database, {
      tenantKey: tenantKeyA,
      attemptId: attemptAId,
      expectedVersion: 0,
      checkpoint: {
        completedStep: "carousel-child-created",
        mediaContainerIds: ["17890000000000001"],
      },
      providerOperationKind: "meta-media-container",
      providerOperationId: "container_17890000000000001",
      checkpointedAt: new Date("2026-08-02T12:02:00.000Z"),
    });

    expect(checkpointed.checkpointVersion).toBe(1);
    expect(
      await readPublishingAttemptForResume(database, tenantKeyA, attemptAId),
    ).toMatchObject({
      attemptId: attemptAId,
      attemptNumber: 1,
      checkpointVersion: 1,
      resumeRequired: true,
      providerCallAllowed: true,
    });
    await expect(
      writePublishingAttemptCheckpoint(database, {
        tenantKey: tenantKeyA,
        attemptId: attemptAId,
        expectedVersion: 0,
        checkpoint: { completedStep: "should-not-overwrite" },
        providerOperationKind: "meta-media-container",
        providerOperationId: "container_other",
        checkpointedAt: new Date("2026-08-02T12:02:01.000Z"),
      }),
    ).rejects.toBeInstanceOf(PublishingCheckpointConflictError);
    await writePublishingAttemptCheckpoint(database, {
      tenantKey: tenantKeyB,
      attemptId: attemptBId,
      expectedVersion: 0,
      checkpoint: {
        publishId: "v2.publish.bravo",
        acceptedByteRange: "bytes 0-4095/4096",
        status: "PROCESSING_UPLOAD",
      },
      providerOperationKind: "tiktok-publish",
      providerOperationId: "publish_bravo_1",
      checkpointedAt: new Date("2026-08-02T12:02:00.000Z"),
    });
    await expect(
      readPublishingAttemptForResume(database, tenantKeyB, attemptAId),
    ).rejects.toBeInstanceOf(PublishingResourceOwnershipError);
  });

  it("records immutable published receipts with multiple remote publication IDs", async () => {
    const receiptA = await recordPublishingReceipt(database, {
      tenantKey: tenantKeyA,
      postStateId: postStateAId,
      attemptId: attemptAId,
      provider: "instagram",
      result: "published",
      responseDigest: "1".repeat(64),
      safeMetadata: { apiVersion: "v24.0", result: "published" },
      remotePublications: [
        {
          remotePublicationId: "instagram_post_1",
          observableUrl: "https://www.instagram.com/p/alpha-one/",
        },
        {
          remotePublicationId: "instagram_post_2",
          observableUrl: "https://www.instagram.com/p/alpha-two/",
        },
      ],
      observedAt: new Date("2026-08-02T12:03:00.000Z"),
    });
    receiptAId = receiptA.id;
    const recovered = await recordPublishingReceipt(database, {
      tenantKey: tenantKeyA,
      postStateId: postStateAId,
      attemptId: attemptAId,
      provider: "instagram",
      result: "published",
      responseDigest: "1".repeat(64),
      safeMetadata: { apiVersion: "v24.0", result: "published" },
      remotePublications: [
        {
          remotePublicationId: "instagram_post_1",
          observableUrl: "https://www.instagram.com/p/alpha-one/",
        },
        {
          remotePublicationId: "instagram_post_2",
          observableUrl: "https://www.instagram.com/p/alpha-two/",
        },
      ],
      observedAt: new Date("2026-08-02T12:03:00.000Z"),
    });

    expect(recovered.id).toBe(receiptA.id);
    expect(receiptA.publications).toHaveLength(2);
    expect(
      await readPublishingAttemptForResume(database, tenantKeyA, attemptAId),
    ).toMatchObject({ providerCallAllowed: false, resumeRequired: true });
    await expect(
      recordPublishingReceipt(database, {
        tenantKey: tenantKeyA,
        postStateId: postStateAId,
        attemptId: attemptAId,
        provider: "instagram",
        result: "published",
        responseDigest: "2".repeat(64),
        safeMetadata: { result: "duplicate-success" },
        remotePublications: [
          { remotePublicationId: "instagram_duplicate_success" },
        ],
        observedAt: new Date("2026-08-02T12:03:01.000Z"),
      }),
    ).rejects.toBeInstanceOf(PublishingReceiptConflictError);

    const receiptB = await recordPublishingReceipt(database, {
      tenantKey: tenantKeyB,
      postStateId: postStateBId,
      attemptId: attemptBId,
      provider: "tiktok",
      result: "published",
      responseDigest: "3".repeat(64),
      safeMetadata: { result: "published", visibility: "SELF_ONLY" },
      remotePublications: [],
      observedAt: new Date("2026-08-02T12:03:00.000Z"),
    });
    receiptBId = receiptB.id;
    expect(receiptB.publications).toEqual([]);

    expect(
      (await listTenantReceipts(database, tenantKeyA)).map(({ id }) => id),
    ).toEqual([receiptAId]);
    expect(
      (await listTenantReceipts(database, tenantKeyB)).map(({ id }) => id),
    ).toEqual([receiptBId]);
  });

  it("isolates append-only analytics and audit observations by Clerk tenant", async () => {
    await appendPublishingAnalyticsSnapshot(database, {
      tenantKey: tenantKeyA,
      integrationId: integrationAId,
      postStateId: postStateAId,
      receiptId: receiptAId,
      metricWindowStart: new Date("2026-08-01T00:00:00.000Z"),
      metricWindowEnd: new Date("2026-08-02T00:00:00.000Z"),
      observedAt: new Date("2026-08-02T12:04:00.000Z"),
      metrics: { views: 120, likes: 12 },
    });
    await appendPublishingAnalyticsSnapshot(database, {
      tenantKey: tenantKeyB,
      integrationId: integrationBId,
      postStateId: postStateBId,
      receiptId: receiptBId,
      metricWindowStart: new Date("2026-08-01T00:00:00.000Z"),
      metricWindowEnd: new Date("2026-08-02T00:00:00.000Z"),
      observedAt: new Date("2026-08-02T12:04:00.000Z"),
      metrics: { views: 80, likes: 8 },
    });
    await appendPublishingAuditEvent(database, {
      tenantKey: tenantKeyA,
      actorClerkUserId: "user_alpha",
      requestId: "analytics_alpha",
      action: "publishing.analytics.refresh",
      subjectType: "integration",
      subjectId: integrationAId,
      result: "observed",
      safeMetadata: { metricCount: 2 },
    });
    await appendPublishingAuditEvent(database, {
      tenantKey: tenantKeyB,
      actorClerkUserId: "user_bravo",
      requestId: "analytics_bravo",
      action: "publishing.analytics.refresh",
      subjectType: "integration",
      subjectId: integrationBId,
      result: "observed",
      safeMetadata: { metricCount: 2 },
    });

    expect(
      (await listTenantAnalyticsSnapshots(database, tenantKeyA)).every(
        ({ tenantId }) => tenantId === tenantAId,
      ),
    ).toBe(true);
    expect(
      (await listTenantAnalyticsSnapshots(database, tenantKeyB)).every(
        ({ tenantId }) => tenantId === tenantBId,
      ),
    ).toBe(true);
    expect(
      (await listTenantAuditEvents(database, tenantKeyA)).every(
        ({ tenantId }) => tenantId === tenantAId,
      ),
    ).toBe(true);
    expect(
      (await listTenantAuditEvents(database, tenantKeyB)).every(
        ({ tenantId }) => tenantId === tenantBId,
      ),
    ).toBe(true);

    const [postStatePage, attemptPage, analyticsPage] = await Promise.all([
      listTenantPostStates(database, tenantKeyA, {
        integrationId: integrationAId,
        limit: 1,
      }),
      listTenantAttempts(database, tenantKeyA, { limit: 1 }),
      listTenantAnalyticsSnapshots(database, tenantKeyA, {
        integrationId: integrationAId,
        observedAtOrAfter: new Date("2026-08-01T00:00:00.000Z"),
        limit: 1,
      }),
    ]);

    expect(postStatePage).toHaveLength(1);
    expect(postStatePage[0]?.integration).not.toHaveProperty("token");
    expect(postStatePage[0]?.integration).not.toHaveProperty("refreshToken");
    expect(attemptPage).toHaveLength(1);
    expect(analyticsPage).toHaveLength(1);
    expect(() =>
      listTenantPostStates(database, tenantKeyA, { limit: 101 }),
    ).toThrow(PublishingPersistenceValidationError);

    await expect(
      appendPublishingAnalyticsSnapshot(database, {
        tenantKey: tenantKeyB,
        integrationId: integrationAId,
        metricWindowStart: new Date("2026-08-01T00:00:00.000Z"),
        metricWindowEnd: new Date("2026-08-02T00:00:00.000Z"),
        observedAt: new Date("2026-08-02T12:04:00.000Z"),
        metrics: { views: 1 },
      }),
    ).rejects.toBeInstanceOf(PublishingResourceOwnershipError);
  });

  it("enforces provider, cross-tenant, and state-shape invariants in PostgreSQL", async () => {
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingIntegrationSecret" (
          "id", "tenantId", "integrationId", "providerIdentifier",
          "tokenKind", "envelope", "version"
        ) VALUES ($1, $2, $3, 'YOUTUBE', 'REFRESH', $4, 1)`,
        ["invalid-provider", tenantAId, integrationAId, "ciphertext"],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingIntegrationSecret" (
          "id", "tenantId", "integrationId", "providerIdentifier",
          "tokenKind", "envelope", "version"
        ) VALUES ($1, $2, $3, 'INSTAGRAM', 'REFRESH', $4, 1)`,
        ["cross-secret", tenantBId, integrationAId, "ciphertext"],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingIntegrationSecret" (
          "id", "tenantId", "integrationId", "providerIdentifier",
          "tokenKind", "envelope", "version"
        ) VALUES ($1, $2, $3, 'INSTAGRAM', 'LONG_LIVED_ACCESS', $4, 0)`,
        ["bad-secret-version", tenantAId, integrationAId, "ciphertext"],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingIntegrationSecret" (
          "id", "tenantId", "integrationId", "providerIdentifier",
          "tokenKind", "envelope", "version", "createdAt", "replacedAt"
        ) VALUES (
          $1, $2, $3, 'INSTAGRAM', 'LONG_LIVED_ACCESS', $4, 1,
          '2026-08-02T12:00:00Z', '2026-08-02T11:59:59Z'
        )`,
        ["bad-secret-time", tenantAId, integrationAId, "ciphertext"],
      ),
    ).rejects.toThrow();

    const rawMedia = await database.media.create({
      data: {
        name: "Raw alpha media",
        path: "clipstitchr-media-source:raw-alpha",
        organizationId: organizationAId,
        fileSize: 1,
        type: "image/webp",
      },
    });
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingMediaSource" (
          "id", "tenantId", "mediaId", "sourceKind", "sourceRecordId",
          "sourceRevision", "contentChecksum", "objectManifest", "mediaType",
          "byteLength", "compatibilityFacts"
        ) VALUES ($1, $2, $3, 'LIBRARY', $4, $5, $6, $7, $8, 1, '{}'::jsonb)`,
        [
          "cross-media-source",
          tenantBId,
          rawMedia.id,
          "raw-alpha",
          "4".repeat(64),
          "5".repeat(64),
          JSON.stringify([
            {
              orderedIndex: 0,
              objectKey: "publishing/alpha/raw.webp",
              objectVersion: "v1",
              checksum: "5".repeat(64),
              byteLength: 1,
              contentType: "image/webp",
            },
          ]),
          "image/webp",
        ],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingMediaSource" (
          "id", "tenantId", "mediaId", "sourceKind", "sourceRecordId",
          "sourceRevision", "contentChecksum", "objectManifest", "mediaType",
          "byteLength", "compatibilityFacts"
        ) VALUES ($1, $2, $3, 'LIBRARY', $4, $5, $6, $7, $8, 1, '{}'::jsonb)`,
        [
          "missing-content-type-source",
          tenantAId,
          rawMedia.id,
          "raw-alpha-missing-content-type",
          "8".repeat(64),
          "9".repeat(64),
          JSON.stringify([
            {
              orderedIndex: 0,
              objectKey: "publishing/alpha/raw.webp",
              objectVersion: "v1",
              checksum: "9".repeat(64),
              byteLength: 1,
            },
          ]),
          "image/webp",
        ],
      ),
    ).rejects.toThrow();

    const rawPost = await database.post.create({
      data: {
        publishDate: new Date("2026-08-05T00:00:00.000Z"),
        organizationId: organizationAId,
        integrationId: integrationAId,
        content: "Raw post",
        group: "raw-post-group",
      },
    });
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingPostState" (
          "id", "tenantId", "postId", "integrationId", "idempotencyKey",
          "canonicalRequestHash", "intent", "scheduledTimeZone", "scheduledLocalTime",
          "scheduledUtcOffsetMinutes", "workflowId", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 'SCHEDULE', 'UTC', '2026-08-05T00:00:00', 0,
          $7, CURRENT_TIMESTAMP
        )`,
        [
          "cross-post-state",
          tenantBId,
          rawPost.id,
          integrationAId,
          "cross-state",
          "6".repeat(64),
          "cross-state-workflow",
        ],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingAttempt" (
          "id", "tenantId", "postStateId", "attemptNumber",
          "actorClerkUserId", "updatedAt"
        ) VALUES ($1, $2, $3, 2, $4, CURRENT_TIMESTAMP)`,
        ["cross-attempt", tenantBId, postStateAId, "user_bravo"],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingReceipt" (
          "id", "tenantId", "postStateId", "attemptId", "providerIdentifier",
          "resultClass", "responseDigest", "safeMetadata", "observedAt"
        ) VALUES (
          $1, $2, $3, $4, 'INSTAGRAM', 'UNCERTAIN', $5, '{}'::jsonb,
          CURRENT_TIMESTAMP
        )`,
        ["cross-receipt", tenantBId, postStateAId, attemptAId, "7".repeat(64)],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingOutbox" (
          "id", "tenantId", "postStateId", "workflowId", "eventType",
          "eventVersion", "payload", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, 2, '{}'::jsonb, CURRENT_TIMESTAMP)`,
        [
          "cross-outbox",
          tenantBId,
          postStateAId,
          workflowAId,
          "publishing.cross-tenant",
        ],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingAnalyticsSnapshot" (
          "id", "tenantId", "integrationId", "metricWindowStart",
          "metricWindowEnd", "observedAt", "metrics"
        ) VALUES (
          $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP, '{}'::jsonb
        )`,
        ["cross-analytics", tenantBId, integrationAId],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingReceiptPublication" (
          "id", "tenantId", "receiptId", "providerIdentifier",
          "remotePublicationId"
        ) VALUES ($1, $2, $3, 'INSTAGRAM', $4)`,
        ["cross-publication", tenantBId, receiptAId, "cross_remote_post"],
      ),
    ).rejects.toThrow();

    await expect(
      administrator.query(
        `UPDATE "ClipPublishingPostState"
         SET "sourceRecordId" = NULL
         WHERE "id" = $1`,
        [postStateAId],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `UPDATE "ClipPublishingPostState"
         SET "disposition" = 'CANCELED'
         WHERE "id" = $1`,
        [postStateAId],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `UPDATE "ClipPublishingOutbox"
         SET "status" = 'PENDING'
         WHERE "id" = (
           SELECT "id"
           FROM "ClipPublishingOutbox"
           WHERE "status" = 'LEASED'
           LIMIT 1
         )`,
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `INSERT INTO "ClipPublishingAnalyticsSnapshot" (
          "id", "tenantId", "metricWindowStart", "metricWindowEnd",
          "observedAt", "metrics"
        ) VALUES (
          $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP, '{}'::jsonb
        )`,
        ["subjectless-analytics", tenantAId],
      ),
    ).rejects.toThrow();

    expect(organizationBId).not.toBe(organizationAId);
    expect(mediaAId).not.toBe(mediaBId);
  });

  it("enforces deferred receipt/publication success invariants", async () => {
    const invariantDestination = await createPublishingDestination(
      database,
      {
        tenantKey: tenantKeyA,
        integrationId: integrationAId,
        mediaSourceId: mediaSourceAId,
        idempotencyKey: "receipt-invariant-destination",
        actorClerkUserId: "user_alpha",
        requestId: "receipt_invariant",
        content: "Receipt invariant",
        destinationSettings: { placement: "feed" },
        intent: {
          kind: "schedule",
          schedule: {
            localDateTime: "2026-08-06T00:00:00",
            timeZone: "UTC",
            utcOffsetMinutes: 0,
          },
        },
        group: "receipt-invariant-group",
      },
      new Date("2026-08-02T12:00:00.000Z"),
    );

    await administrator.query("BEGIN");
    await administrator.query(
      `INSERT INTO "ClipPublishingReceipt" (
        "id", "tenantId", "postStateId", "attemptId", "providerIdentifier",
        "resultClass", "responseDigest", "safeMetadata", "observedAt"
      ) VALUES (
        $1, $2, $3, $4, 'INSTAGRAM', 'PUBLISHED', $5, '{}'::jsonb,
        CURRENT_TIMESTAMP
      )`,
      [
        "published-without-publication",
        tenantAId,
        invariantDestination.postStateId,
        invariantDestination.attemptId,
        "b".repeat(64),
      ],
    );
    await expect(administrator.query("COMMIT")).rejects.toThrow();
    await administrator.query("ROLLBACK");

    await administrator.query("BEGIN");
    await administrator.query(
      `INSERT INTO "ClipPublishingReceipt" (
        "id", "tenantId", "postStateId", "attemptId", "providerIdentifier",
        "resultClass", "responseDigest", "safeMetadata", "observedAt"
      ) VALUES (
        $1, $2, $3, $4, 'INSTAGRAM', 'UNCERTAIN', $5, '{}'::jsonb,
        CURRENT_TIMESTAMP
      )`,
      [
        "uncertain-with-publication",
        tenantAId,
        invariantDestination.postStateId,
        invariantDestination.attemptId,
        "c".repeat(64),
      ],
    );
    await administrator.query(
      `INSERT INTO "ClipPublishingReceiptPublication" (
        "id", "tenantId", "receiptId", "providerIdentifier",
        "remotePublicationId"
      ) VALUES ($1, $2, $3, 'INSTAGRAM', $4)`,
      [
        "publication-on-uncertain",
        tenantAId,
        "uncertain-with-publication",
        "remote_uncertain",
      ],
    );
    await expect(administrator.query("COMMIT")).rejects.toThrow();
    await administrator.query("ROLLBACK");
  });

  it("prevents mutation of committed receipts and remote publications", async () => {
    const publication =
      await database.clipPublishingReceiptPublication.findFirstOrThrow({
        where: { receiptId: receiptAId },
      });

    await expect(
      administrator.query(
        `UPDATE "ClipPublishingReceipt"
         SET "safeMetadata" = '{"changed":true}'::jsonb
         WHERE "id" = $1`,
        [receiptAId],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        'DELETE FROM "ClipPublishingReceipt" WHERE "id" = $1',
        [receiptAId],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        `UPDATE "ClipPublishingReceiptPublication"
         SET "remotePublicationId" = 'changed'
         WHERE "id" = $1`,
        [publication.id],
      ),
    ).rejects.toThrow();
    await expect(
      administrator.query(
        'DELETE FROM "ClipPublishingReceiptPublication" WHERE "id" = $1',
        [publication.id],
      ),
    ).rejects.toThrow();
  });
});
