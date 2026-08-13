import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import type { ProviderAnalyticsMetric } from "../provider-runtime/contracts/ProviderAnalyticsMetric.js";
import type { PublishingApiAnalyticsRefreshTarget } from "./PublishingApiAnalyticsRefreshTarget.js";
import type { PublishingApiAnalyticsResponse } from "./PublishingApiAnalyticsResponse.js";
import type { PublishingApiCompatibilityRequest } from "./PublishingApiCompatibilityRequest.js";
import type { PublishingApiCreatePostRequest } from "./PublishingApiCreatePostRequest.js";
import type { PublishingApiPostDetail } from "./PublishingApiPostDetail.js";
import type { PublishingApiPostStatus } from "./PublishingApiPostStatus.js";
import type { PublishingApiPostSummary } from "./PublishingApiPostSummary.js";

export type PublishingApiStore = Readonly<{
  ensureTenant: (identity: ClerkTenantIdentity) => Promise<void>;
  inspectCompatibility: (
    tenantKey: ClerkTenantIdentity["tenantKey"],
    request: PublishingApiCompatibilityRequest,
  ) => Promise<unknown>;
  createPost: (
    identity: ClerkTenantIdentity,
    requestId: string,
    request: PublishingApiCreatePostRequest,
    now: Date,
  ) => Promise<unknown>;
  listPosts: (
    tenantKey: ClerkTenantIdentity["tenantKey"],
    productId: string,
    status?: PublishingApiPostStatus,
  ) => Promise<readonly PublishingApiPostSummary[]>;
  readPost: (
    tenantKey: ClerkTenantIdentity["tenantKey"],
    productId: string,
    postId: string,
  ) => Promise<PublishingApiPostDetail>;
  cancelPost: (
    identity: ClerkTenantIdentity,
    requestId: string,
    productId: string,
    postId: string,
    now: Date,
  ) => Promise<PublishingApiPostDetail>;
  retryPost: (
    identity: ClerkTenantIdentity,
    requestId: string,
    productId: string,
    postId: string,
    now: Date,
  ) => Promise<PublishingApiPostDetail>;
  listCalendar: (
    tenantKey: ClerkTenantIdentity["tenantKey"],
    productId: string,
    from: Date,
    to: Date,
  ) => Promise<readonly PublishingApiPostSummary[]>;
  listAnalytics: (
    tenantKey: ClerkTenantIdentity["tenantKey"],
    productId: string,
    range: "7d" | "30d" | "90d",
    now: Date,
  ) => Promise<PublishingApiAnalyticsResponse>;
  prepareAnalyticsRefresh: (
    tenantKey: ClerkTenantIdentity["tenantKey"],
    productId: string,
    postId: string,
  ) => Promise<PublishingApiAnalyticsRefreshTarget>;
  saveAnalyticsRefresh: (
    tenantKey: ClerkTenantIdentity["tenantKey"],
    target: PublishingApiAnalyticsRefreshTarget,
    metrics: readonly ProviderAnalyticsMetric[],
    observedAt: Date,
  ) => Promise<readonly import("./PublishingApiAnalyticsMetric.js").PublishingApiAnalyticsMetric[]>;
}>;
