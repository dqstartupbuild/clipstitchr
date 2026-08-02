import { describe, expect, it, vi } from "vitest";

import { verifyPublishingMediaGatewayToken } from "../src/media-gateway/verifyPublishingMediaGatewayToken.js";
import { createPublishingWorkflowMediaGrantResolver } from "../src/media-gateway/createPublishingWorkflowMediaGrantResolver.js";
import type { PublishingWorkflowWorkItem } from "../src/workflow/PublishingWorkflowWorkItem.js";
import { ProviderRuntimeError } from "../src/provider-runtime/errors/ProviderRuntimeError.js";

const tokenSecret = "token-secret-that-is-at-least-thirty-two-bytes";
const quotaSecret = "quota-secret-that-is-at-least-thirty-two-bytes";
const publicOrigin = "https://media.clipstitchr.example";
const checksumBytes = Buffer.alloc(32, 7);
const checksumHex = checksumBytes.toString("hex");
const checksumBase64 = checksumBytes.toString("base64");

const createItem = (
  provider: PublishingWorkflowWorkItem["provider"] = "tiktok",
): PublishingWorkflowWorkItem => ({
  tenantKey: "org_clerk-org" as PublishingWorkflowWorkItem["tenantKey"],
  postStateId: "post-state",
  attemptId: "attempt",
  attemptKey: "attempt-key",
  checkpointVersion: 0,
  checkpoint: {},
  providerCallAllowed: true,
  alreadyPublished: false,
  terminal: false,
  provider,
  integrationId: "integration",
  accountId: "account",
  grantedScopes: [],
  caption: "A finished clip",
  settings:
    provider === "tiktok"
      ? { provider: "tiktok", mode: "inbox" }
      : { provider: "instagram", placement: "feed" },
  media: [
    {
      orderedIndex: 0,
      objectKey: "publishing/org/clip.mp4",
      version: 'version:version-1|etag:"etag-1"',
      checksum: checksumHex,
      byteLength: 1_024,
      contentType: "video/mp4",
      durationSeconds: 12,
    },
  ],
  createdAtEpochMilliseconds: 1_800_000_000_000,
});

describe("createPublishingWorkflowMediaGrantResolver", () => {
  it("re-heads the immutable object and issues a short-lived TikTok grant", async () => {
    const now = 1_800_000_000_000;
    const headObject = vi.fn().mockResolvedValue({
      byteLength: 1_024,
      checksumSha256: checksumBase64,
      contentType: "video/mp4",
      etag: '"etag-1"',
      versionId: "version-1",
    });
    const resolve = createPublishingWorkflowMediaGrantResolver({
      createGrantKeyBytes: () => Buffer.alloc(16, 3),
      createInitializationVector: () => Buffer.alloc(12, 4),
      headObject,
      nowEpochMilliseconds: () => now,
      publicOrigin,
      quotaSecret,
      tokenSecret,
    });

    const [grant] = await resolve(createItem());
    const token = grant?.url.slice(grant.url.lastIndexOf("/") + 1);
    const claims = verifyPublishingMediaGatewayToken(
      token ?? "",
      tokenSecret,
      publicOrigin,
      now,
    );

    expect(headObject).toHaveBeenCalledWith("publishing/org/clip.mp4");
    expect(grant?.expiresAtEpochMilliseconds).toBe(now + 4_500_000);
    expect(claims).toMatchObject({
      contentType: "video/mp4",
      etag: '"etag-1"',
      objectKey: "publishing/org/clip.mp4",
      provider: "tiktok",
      sizeBytes: 1_024,
      versionId: "version-1",
    });
  });

  it("uses the Instagram grant window for both Instagram connection modes", async () => {
    const now = 1_800_000_000_000;
    const resolve = createPublishingWorkflowMediaGrantResolver({
      createGrantKeyBytes: () => Buffer.alloc(16, 3),
      createInitializationVector: () => Buffer.alloc(12, 4),
      headObject: async () => ({
        byteLength: 1_024,
        checksumSha256: checksumBase64,
        contentType: "video/mp4",
        etag: '"etag-1"',
        versionId: "version-1",
      }),
      nowEpochMilliseconds: () => now,
      publicOrigin,
      quotaSecret,
      tokenSecret,
    });

    for (const provider of ["instagram", "instagram-standalone"] as const) {
      const [grant] = await resolve(createItem(provider));
      expect(grant?.expiresAtEpochMilliseconds).toBe(now + 900_000);
    }
  });

  it("rejects a changed checksum before any provider call", async () => {
    const resolve = createPublishingWorkflowMediaGrantResolver({
      headObject: async () => ({
        byteLength: 1_024,
        checksumSha256: Buffer.alloc(32, 8).toString("base64"),
        contentType: "video/mp4",
        etag: '"etag-1"',
        versionId: "version-1",
      }),
      publicOrigin,
      quotaSecret,
      tokenSecret,
    });

    await expect(resolve(createItem())).rejects.toMatchObject({
      code: "invalid_request",
    } satisfies Partial<ProviderRuntimeError>);
  });

  it("rejects manifests without a durable version or ETag binding", async () => {
    const item = createItem();
    const resolve = createPublishingWorkflowMediaGrantResolver({
      headObject: async () => ({
        byteLength: 1_024,
        checksumSha256: checksumBase64,
        contentType: "video/mp4",
        etag: '"etag-1"',
      }),
      publicOrigin,
      quotaSecret,
      tokenSecret,
    });

    await expect(
      resolve({
        ...item,
        media: [{ ...item.media[0]!, version: "legacy-version" }],
      }),
    ).rejects.toMatchObject({ code: "invalid_request" });
  });
});
