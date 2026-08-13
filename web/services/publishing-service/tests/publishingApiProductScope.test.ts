import type { IncomingMessage } from "node:http";

import { describe, expect, it, vi } from "vitest";

import type { ServiceAssertionClaims } from "../src/assertions/ServiceAssertionClaims.js";
import { derivePersonalTenantKey } from "../src/identity/derivePersonalTenantKey.js";
import type { PublishingApiAnalyticsResponse } from "../src/publishing-api/PublishingApiAnalyticsResponse.js";
import type { PublishingApiPostDetail } from "../src/publishing-api/PublishingApiPostDetail.js";
import type { PublishingApiStore } from "../src/publishing-api/PublishingApiStore.js";
import { createCancelPublishingPostRoute } from "../src/publishing-api/createCancelPublishingPostRoute.js";
import { createListPublishingAnalyticsRoute } from "../src/publishing-api/createListPublishingAnalyticsRoute.js";
import { createListPublishingCalendarRoute } from "../src/publishing-api/createListPublishingCalendarRoute.js";
import { createListPublishingPostsRoute } from "../src/publishing-api/createListPublishingPostsRoute.js";
import { createReadPublishingPostRoute } from "../src/publishing-api/createReadPublishingPostRoute.js";
import { createRetryPublishingPostRoute } from "../src/publishing-api/createRetryPublishingPostRoute.js";
import type { PublishingServiceRoute } from "../src/server/PublishingServiceRoute.js";

const TENANT_KEY = derivePersonalTenantKey("user_product_scope");
const claims: ServiceAssertionClaims = {
  version: 1,
  issuer: "clipstitchr-web",
  audience: "publishing-service",
  tenantKey: TENANT_KEY,
  actorUserId: "user_product_scope",
  action: "publishing.posts.read",
  requestId: "request_product_scope",
  nonce: "n".repeat(32),
  issuedAt: 1,
  expiresAt: 2,
};
const post = {} as PublishingApiPostDetail;
const analytics = {
  productId: "product_1",
  metrics: [],
  observedAt: null,
  publications: [],
  range: "30d",
  unsupported: [],
} as PublishingApiAnalyticsResponse;

const createStore = (): PublishingApiStore => ({
  ensureTenant: vi.fn(async () => undefined),
  inspectCompatibility: vi.fn(),
  createPost: vi.fn(),
  listPosts: vi.fn(async () => []),
  readPost: vi.fn(async () => post),
  cancelPost: vi.fn(async () => post),
  retryPost: vi.fn(async () => post),
  listCalendar: vi.fn(async () => []),
  listAnalytics: vi.fn(async () => analytics),
  prepareAnalyticsRefresh: vi.fn(),
  saveAnalyticsRefresh: vi.fn(),
});

const invoke = (
  route: PublishingServiceRoute,
  input: Readonly<{
    body?: unknown;
    match?: Readonly<Record<string, string>>;
    query?: string;
  }>,
) =>
  route.handle({
    body: input.body,
    claims,
    match: input.match ?? {},
    request: {} as IncomingMessage,
    searchParams: new URLSearchParams(input.query),
  });

describe("publishing API Product scope", () => {
  it("forwards Product scope through list, detail, cancel, and retry", async () => {
    const store = createStore();
    const dependencies = { providerRuntimes: new Map(), store };

    await invoke(createListPublishingPostsRoute(dependencies), {
      query: "productId=product_1",
    });
    await invoke(createReadPublishingPostRoute(dependencies), {
      match: { postId: "post_1" },
      query: "productId=product_1",
    });
    await invoke(createCancelPublishingPostRoute(dependencies), {
      body: { productId: "product_1" },
      match: { postId: "post_1" },
    });
    await invoke(createRetryPublishingPostRoute(dependencies), {
      body: { productId: "product_1" },
      match: { postId: "post_1" },
    });

    expect(store.listPosts).toHaveBeenCalledWith(TENANT_KEY, "product_1", undefined);
    expect(store.readPost).toHaveBeenCalledWith(TENANT_KEY, "product_1", "post_1");
    expect(store.cancelPost).toHaveBeenCalledWith(
      expect.objectContaining({ tenantKey: TENANT_KEY }),
      "request_product_scope",
      "product_1",
      "post_1",
      expect.any(Date),
    );
    expect(store.retryPost).toHaveBeenCalledWith(
      expect.objectContaining({ tenantKey: TENANT_KEY }),
      "request_product_scope",
      "product_1",
      "post_1",
      expect.any(Date),
    );
  });

  it("forwards Product scope through calendar and analytics", async () => {
    const store = createStore();
    const dependencies = { providerRuntimes: new Map(), store };
    await invoke(createListPublishingCalendarRoute(dependencies), {
      query:
        "productId=product_1&from=2026-08-01T00%3A00%3A00Z&to=2026-08-31T00%3A00%3A00Z&timeZone=UTC",
    });
    await invoke(createListPublishingAnalyticsRoute(dependencies), {
      query: "productId=product_1&range=30d",
    });
    expect(store.listCalendar).toHaveBeenCalledWith(
      TENANT_KEY,
      "product_1",
      new Date("2026-08-01T00:00:00.000Z"),
      new Date("2026-08-31T00:00:00.000Z"),
    );
    expect(store.listAnalytics).toHaveBeenCalledWith(
      TENANT_KEY,
      "product_1",
      "30d",
      expect.any(Date),
    );
  });

  it("rejects missing and duplicate Product bindings before store access", async () => {
    const store = createStore();
    const route = createReadPublishingPostRoute({
      providerRuntimes: new Map(),
      store,
    });
    await expect(
      invoke(route, { match: { postId: "post_1" }, query: "" }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      invoke(route, {
        match: { postId: "post_1" },
        query: "productId=a&productId=b",
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(store.readPost).not.toHaveBeenCalled();
  });
});
