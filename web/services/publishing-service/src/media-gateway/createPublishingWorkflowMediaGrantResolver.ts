import { randomBytes } from "node:crypto";

import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingWorkflowMediaGrant } from "../workflow/PublishingWorkflowMediaGrant.js";
import type { PublishingWorkflowWorkItem } from "../workflow/PublishingWorkflowWorkItem.js";
import type { PublishingWorkflowMediaGrantResolverOptions } from "./PublishingWorkflowMediaGrantResolverOptions.js";
import { createPublishingMediaQuotaIdentity } from "./createPublishingMediaQuotaIdentity.js";
import { normalizePublishingMediaPublicOrigin } from "./normalizePublishingMediaPublicOrigin.js";
import { parsePublishingMediaObjectIdentity } from "./parsePublishingMediaObjectIdentity.js";
import { readPublishingMediaGrantValiditySeconds } from "./readPublishingMediaGrantValiditySeconds.js";
import { readPublishingMediaSha256HexDigest } from "./readPublishingMediaSha256HexDigest.js";
import { sealPublishingMediaGatewayToken } from "./sealPublishingMediaGatewayToken.js";

export const createPublishingWorkflowMediaGrantResolver = (
  options: PublishingWorkflowMediaGrantResolverOptions,
): ((
  item: PublishingWorkflowWorkItem,
) => Promise<readonly PublishingWorkflowMediaGrant[]>) => {
  const publicOrigin = normalizePublishingMediaPublicOrigin(options.publicOrigin);
  const createGrantKeyBytes = options.createGrantKeyBytes ?? (() => randomBytes(16));
  const nowEpochMilliseconds = options.nowEpochMilliseconds ?? Date.now;

  return async (item) => {
    const provider = item.provider === "tiktok" ? "tiktok" : "instagram";
    const quotaIdentity = createPublishingMediaQuotaIdentity(
      item.tenantKey,
      options.quotaSecret,
    );
    const validitySeconds = readPublishingMediaGrantValiditySeconds(
      item.provider,
    );
    const grants = await Promise.all(
      item.media.map(async (mediaObject) => {
        let head;

        try {
          head = await options.headObject(mediaObject.objectKey);
        } catch {
          throw new ProviderRuntimeError(item.provider, "invalid_request");
        }

        const expectedIdentity = parsePublishingMediaObjectIdentity(
          mediaObject.version,
        );
        const actualContentType = head.contentType.trim().toLowerCase();
        const actualChecksum = readPublishingMediaSha256HexDigest(
          head.checksumSha256,
        );

        if (
          !Number.isSafeInteger(head.byteLength) ||
          head.byteLength !== mediaObject.byteLength ||
          actualContentType !== mediaObject.contentType ||
          actualChecksum !== mediaObject.checksum ||
          (expectedIdentity.versionId !== undefined &&
            expectedIdentity.versionId !== head.versionId) ||
          (expectedIdentity.etag !== undefined &&
            expectedIdentity.etag !== head.etag) ||
          (expectedIdentity.versionId === undefined &&
            expectedIdentity.etag === undefined) ||
          (head.versionId === undefined && head.etag === undefined)
        ) {
          throw new ProviderRuntimeError(item.provider, "invalid_request");
        }

        const grantKeyBytes = createGrantKeyBytes();

        if (grantKeyBytes.byteLength !== 16) {
          throw new Error("Publishing media grant key generation failed.");
        }

        const issuedAtEpochMs = nowEpochMilliseconds();
        const expiresAtEpochMs = issuedAtEpochMs + validitySeconds * 1_000;
        const token = sealPublishingMediaGatewayToken(
          {
            audience: publicOrigin,
            ...(head.checksumSha256 === undefined
              ? {}
              : { checksum: `sha256:${head.checksumSha256.trim()}` }),
            contentType: actualContentType,
            ...(head.etag === undefined ? {} : { etag: head.etag }),
            expiresAtEpochMs,
            grantKey: `pmg_${grantKeyBytes.toString("base64url")}`,
            issuedAtEpochMs,
            objectKey: mediaObject.objectKey,
            provider,
            quotaIdentity,
            schema: 1,
            sizeBytes: mediaObject.byteLength,
            ...(head.versionId === undefined
              ? {}
              : { versionId: head.versionId }),
          },
          options.tokenSecret,
          options.createInitializationVector,
        );

        return Object.freeze({
          expiresAtEpochMilliseconds: expiresAtEpochMs,
          url: `${publicOrigin}/api/publishing/media/${token}`,
        });
      }),
    );

    return Object.freeze(grants);
  };
};
