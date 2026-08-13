import { createHash } from "node:crypto";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { PublishingRateLimitAction } from "./PublishingRateLimitAction.js";
import type { RedisSecurityNamespace } from "../redis/RedisSecurityNamespace.js";

export const createPublishingRateLimitKeys = (
  namespace: RedisSecurityNamespace,
  action: PublishingRateLimitAction,
  tenantKey: PublishingTenantKey,
): readonly [string, string] => {
  const redisClusterHashTag = `{clipstitchr-publishing-rate-limit:${namespace}:v1}`;
  const tenantDigest = createHash("sha256")
    .update(tenantKey, "utf8")
    .digest("base64url");

  return Object.freeze([
    `${redisClusterHashTag}:global:${action}`,
    `${redisClusterHashTag}:tenant:${action}:${tenantDigest}`,
  ]);
};
