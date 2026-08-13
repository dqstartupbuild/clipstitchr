import { resolveOrCreatePublishingTenant } from "../persistence/resolveOrCreatePublishingTenant.js";
import { cancelPrismaPublishingApiPost } from "./cancelPrismaPublishingApiPost.js";
import { createPrismaPublishingApiPost } from "./createPrismaPublishingApiPost.js";
import { inspectPrismaPublishingApiCompatibility } from "./inspectPrismaPublishingApiCompatibility.js";
import { listPrismaPublishingApiAnalytics } from "./listPrismaPublishingApiAnalytics.js";
import { listPrismaPublishingApiCalendar } from "./listPrismaPublishingApiCalendar.js";
import { listPrismaPublishingApiPosts } from "./listPrismaPublishingApiPosts.js";
import { preparePrismaPublishingApiAnalyticsRefresh } from "./preparePrismaPublishingApiAnalyticsRefresh.js";
import type { PrismaPublishingApiStoreOptions } from "./PrismaPublishingApiStoreOptions.js";
import type { PublishingApiStore } from "./PublishingApiStore.js";
import { readPrismaPublishingApiPost } from "./readPrismaPublishingApiPost.js";
import { retryPrismaPublishingApiPost } from "./retryPrismaPublishingApiPost.js";
import { savePrismaPublishingApiAnalyticsRefresh } from "./savePrismaPublishingApiAnalyticsRefresh.js";

export const createPrismaPublishingApiStore = (
  options: PrismaPublishingApiStoreOptions,
): PublishingApiStore => ({
  async ensureTenant(identity) {
    await resolveOrCreatePublishingTenant(options.database, {
      tenantKey: identity.tenantKey,
      organizationName:
        identity.kind === "organization"
          ? "Organization publishing workspace"
          : "Personal publishing workspace",
    });
  },
  inspectCompatibility: (tenantKey, request) =>
    inspectPrismaPublishingApiCompatibility(options.database, tenantKey, request),
  createPost: (identity, requestId, request, now) =>
    createPrismaPublishingApiPost(
      options.database,
      identity,
      requestId,
      request,
      now,
    ),
  listPosts: (tenantKey, productId, status) =>
    listPrismaPublishingApiPosts(options.database, tenantKey, productId, status),
  readPost: (tenantKey, productId, postId) =>
    readPrismaPublishingApiPost(options.database, tenantKey, productId, postId),
  cancelPost: (identity, requestId, productId, postId, now) =>
    cancelPrismaPublishingApiPost(
      options.database,
      identity,
      requestId,
      productId,
      postId,
      now,
    ),
  retryPost: (identity, requestId, productId, postId, now) =>
    retryPrismaPublishingApiPost(
      options.database,
      identity,
      requestId,
      productId,
      postId,
      now,
    ),
  listCalendar: (tenantKey, productId, from, to) =>
    listPrismaPublishingApiCalendar(options.database, tenantKey, productId, from, to),
  listAnalytics: (tenantKey, productId, range, now) =>
    listPrismaPublishingApiAnalytics(options.database, tenantKey, productId, range, now),
  prepareAnalyticsRefresh: (tenantKey, productId, postId) =>
    preparePrismaPublishingApiAnalyticsRefresh(
      options.database,
      options.keyring,
      tenantKey,
      productId,
      postId,
    ),
  saveAnalyticsRefresh: (tenantKey, target, metrics, observedAt) =>
    savePrismaPublishingApiAnalyticsRefresh(
      options.database,
      tenantKey,
      target,
      metrics,
      observedAt,
    ),
});
