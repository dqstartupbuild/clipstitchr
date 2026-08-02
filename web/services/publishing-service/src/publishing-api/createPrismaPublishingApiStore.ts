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

  inspectCompatibility(tenantKey, request) {
    return inspectPrismaPublishingApiCompatibility(
      options.database,
      tenantKey,
      request,
    );
  },

  createPost(identity, requestId, request, now) {
    return createPrismaPublishingApiPost(
      options.database,
      identity,
      requestId,
      request,
      now,
    );
  },

  listPosts(tenantKey, status) {
    return listPrismaPublishingApiPosts(options.database, tenantKey, status);
  },

  readPost(tenantKey, postId) {
    return readPrismaPublishingApiPost(options.database, tenantKey, postId);
  },

  cancelPost(identity, requestId, postId, now) {
    return cancelPrismaPublishingApiPost(
      options.database,
      identity,
      requestId,
      postId,
      now,
    );
  },

  retryPost(identity, requestId, postId, now) {
    return retryPrismaPublishingApiPost(
      options.database,
      identity,
      requestId,
      postId,
      now,
    );
  },

  listCalendar(tenantKey, from, to) {
    return listPrismaPublishingApiCalendar(options.database, tenantKey, from, to);
  },

  listAnalytics(tenantKey, range, now) {
    return listPrismaPublishingApiAnalytics(
      options.database,
      tenantKey,
      range,
      now,
    );
  },

  prepareAnalyticsRefresh(tenantKey, postId) {
    return preparePrismaPublishingApiAnalyticsRefresh(
      options.database,
      options.keyring,
      tenantKey,
      postId,
    );
  },

  saveAnalyticsRefresh(tenantKey, target, metrics, observedAt) {
    return savePrismaPublishingApiAnalyticsRefresh(
      options.database,
      tenantKey,
      target,
      metrics,
      observedAt,
    );
  },
});
