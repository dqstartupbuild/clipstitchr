import { once } from "node:events";
import { createServer } from "node:http";

import { describe, expect, it, vi } from "vitest";

import { InMemoryServiceAssertionReplayProtector } from "../src/assertions/InMemoryServiceAssertionReplayProtector.js";
import type { ServiceAssertionAction } from "../src/assertions/ServiceAssertionAction.js";
import type { ServiceAssertionClaims } from "../src/assertions/ServiceAssertionClaims.js";
import { createServiceAssertionSigningKey } from "../src/assertions/createServiceAssertionSigningKey.js";
import { issueServiceAssertion } from "../src/assertions/issueServiceAssertion.js";
import { PublishingResourceOwnershipError } from "../src/errors/PublishingResourceOwnershipError.js";
import { resolveClerkTenantIdentity } from "../src/identity/resolveClerkTenantIdentity.js";
import type { PublishingIntegrationConnectionStore } from "../src/integrations/PublishingIntegrationConnectionStore.js";
import type { PublishingIntegrationRecord } from "../src/integrations/PublishingIntegrationRecord.js";
import type { PublishingIntegrationRouteDependencies } from "../src/integrations/PublishingIntegrationRouteDependencies.js";
import type { PublishingIntegrationRuntime } from "../src/integrations/PublishingIntegrationRuntime.js";
import { createPublishingIntegrationRoutes } from "../src/integrations/createPublishingIntegrationRoutes.js";
import { RedisOAuthAuthorizationStateStore } from "../src/oauth/RedisOAuthAuthorizationStateStore.js";
import type { ProviderConnection } from "../src/provider-runtime/contracts/ProviderConnection.js";
import type { PublishingProvider } from "../src/providers/PublishingProvider.js";
import { createRedisSecurityNamespace } from "../src/redis/createRedisSecurityNamespace.js";
import type { PublishingServiceRoute } from "../src/server/PublishingServiceRoute.js";
import { createPublishingServiceRequestHandler } from "../src/server/createPublishingServiceRequestHandler.js";
import { InMemoryRedisStringCommands } from "./support/InMemoryRedisStringCommands.js";

const publicOrigin = "https://clipstitchr.test";
const signingKey = createServiceAssertionSigningKey(
  Buffer.alloc(32, 17).toString("base64"),
);

const createClaims = (
  userId: string,
  action: ServiceAssertionAction,
  organizationId?: string,
): ServiceAssertionClaims => {
  const identity = resolveClerkTenantIdentity({
    actorUserId: userId,
    ...(organizationId === undefined
      ? {}
      : { activeOrganizationId: organizationId }),
  });

  return Object.freeze({
    version: 1,
    issuer: "clipstitchr-web",
    audience: "publishing-service",
    tenantKey: identity.tenantKey,
    actorUserId: identity.actorUserId,
    ...(identity.organizationId === undefined
      ? {}
      : { actorOrganizationId: identity.organizationId }),
    action,
    requestId: `request-${userId}`,
    nonce: "n".repeat(32),
    issuedAt: 1,
    expiresAt: 2,
  });
};

const connection = (
  provider: PublishingProvider,
  accountId = `${provider}-account`,
): ProviderConnection =>
  Object.freeze({
    provider,
    accountId,
    accountName: `${provider} account`,
    username: `${provider}_user`,
    pictureUrl: "https://images.example/avatar.jpg",
    accessToken: `${provider}-access-token-private`,
    refreshToken:
      provider === "tiktok" ? "tiktok-refresh-token-private" : undefined,
    expiresInSeconds: 3_600,
    refreshExpiresInSeconds: provider === "tiktok" ? 86_400 : undefined,
    scopes: Object.freeze(["user.info.basic"]),
  });

const record = (
  provider: PublishingProvider,
  id = `${provider}-integration`,
): PublishingIntegrationRecord => ({
  id,
  internalId: `${provider}-account`,
  name: `${provider} account`,
  picture: "https://images.example/avatar.jpg",
  providerIdentifier: provider,
  type: provider,
  disabled: false,
  tokenExpiration: new Date("2026-08-03T00:00:00.000Z"),
  profile: JSON.stringify({ schemaVersion: 1, username: `${provider}_user` }),
  createdAt: new Date("2026-08-01T00:00:00.000Z"),
  updatedAt: new Date("2026-08-02T00:00:00.000Z"),
  refreshNeeded: false,
});

const createStore = () => {
  const records: PublishingIntegrationRecord[] = [];
  const savedConnections: ProviderConnection[][] = [];
  const store: PublishingIntegrationConnectionStore = {
    ensureTenant: vi.fn(async () => undefined),
    list: vi.fn(async () => Object.freeze([...records])),
    saveConnections: vi.fn(async (_tenantKey, values) => {
      savedConnections.push([...values]);
    }),
    refreshConnection: vi.fn(async (_tenantKey, integrationId, refresh) => {
      const integration = records.find(({ id }) => id === integrationId);
      if (integration === undefined) {
        throw new PublishingResourceOwnershipError();
      }
      await refresh({
        integration,
        accessToken: "standalone-access-token-private",
        refreshToken: "tiktok-refresh-token-private",
      });
    }),
    disconnect: vi.fn(async (_identity, integrationId) => {
      const index = records.findIndex(({ id }) => id === integrationId);
      if (index < 0) {
        throw new PublishingResourceOwnershipError();
      }
      records.splice(index, 1);
    }),
    readAccessToken: vi.fn(async (_tenantKey, integrationId, provider) => {
      const integration = records.find(({ id }) => id === integrationId);
      if (integration?.providerIdentifier !== provider) {
        throw new PublishingResourceOwnershipError();
      }
      return "tiktok-access-token-private";
    }),
  };

  return { records, savedConnections, store };
};

const createStateStore = () =>
  new RedisOAuthAuthorizationStateStore(
    new InMemoryRedisStringCommands(Date.now),
    createRedisSecurityNamespace("routes-test"),
  );

const findRoute = (
  routes: readonly PublishingServiceRoute[],
  method: PublishingServiceRoute["method"],
  pathname: string,
) => {
  for (const route of routes) {
    if (route.method !== method) {
      continue;
    }
    const match = route.match(pathname);
    if (match !== null) {
      return { match, route };
    }
  }
  throw new TypeError(`Missing test route ${method} ${pathname}.`);
};

const invokeRoute = async (
  routes: readonly PublishingServiceRoute[],
  method: PublishingServiceRoute["method"],
  pathname: string,
  claims: ServiceAssertionClaims,
  body?: unknown,
  search = "",
) => {
  const { match, route } = findRoute(routes, method, pathname);
  return route.handle({
    body,
    claims,
    match,
    request: {} as never,
    searchParams: new URLSearchParams(search),
  });
};

const createDependencies = (
  store: PublishingIntegrationConnectionStore,
  runtimes: ReadonlyMap<PublishingProvider, PublishingIntegrationRuntime>,
): PublishingIntegrationRouteDependencies => ({
  connectionStore: store,
  now: () => new Date("2026-08-02T12:00:00.000Z"),
  oauthStateStore: createStateStore(),
  publicOrigin,
  runtimes,
});

describe("publishing integration routes", () => {
  it("maps both Instagram runtimes to one redacted public provider", async () => {
    const fixture = createStore();
    fixture.records.push(
      {
        ...record("instagram-standalone"),
        picture:
          "https://images.example/avatar.jpg?access_token=private-avatar-token",
        token: "plaintext-token-must-never-leave",
        envelope: "encrypted-envelope-must-never-leave",
      } as PublishingIntegrationRecord,
      record("tiktok"),
    );
    const runtimes = new Map<PublishingProvider, PublishingIntegrationRuntime>();
    const response = await invokeRoute(
      createPublishingIntegrationRoutes(
        createDependencies(fixture.store, runtimes),
      ),
      "GET",
      "/v1/integrations",
      createClaims("user_list", "publishing.integrations.read"),
    );
    const serialized = JSON.stringify(response.body);

    expect(response.body).toMatchObject({
      providers: [
        {
          canConnect: false,
          provider: "instagram",
          integrations: [{ avatarUrl: null, provider: "instagram" }],
        },
        {
          canConnect: false,
          provider: "tiktok",
          integrations: [{ provider: "tiktok" }],
        },
        {
          canConnect: false,
          provider: "youtube",
          integrations: [],
        },
      ],
    });
    expect(serialized).not.toContain("plaintext-token-must-never-leave");
    expect(serialized).not.toContain("encrypted-envelope-must-never-leave");
    expect(serialized).not.toContain("private-avatar-token");
    expect(serialized).not.toContain("internalId");
  });

  it("prefers standalone Instagram and keeps its callback on the public Instagram path", async () => {
    const fixture = createStore();
    const facebookCreate = vi.fn(() => "https://www.facebook.com/v24.0/dialog/oauth");
    const standaloneCreate = vi.fn((state: string, redirectUri: string) => {
      const url = new URL("https://www.instagram.com/oauth/authorize");
      url.searchParams.set("client_id", "instagram-client");
      url.searchParams.set("state", state);
      url.searchParams.set("redirect_uri", redirectUri);
      return url.toString();
    });
    const runtimes = new Map<PublishingProvider, PublishingIntegrationRuntime>([
      [
        "instagram",
        {
          id: "instagram",
          createAuthorizationUrl: facebookCreate,
          exchangeAuthorizationCode: async () => connection("instagram"),
          listInstagramAccounts: async () => [],
        },
      ],
      [
        "instagram-standalone",
        {
          id: "instagram-standalone",
          createAuthorizationUrl: standaloneCreate,
          exchangeAuthorizationCode: async () =>
            connection("instagram-standalone"),
          refreshConnection: async () => connection("instagram-standalone"),
        },
      ],
    ]);
    const response = await invokeRoute(
      createPublishingIntegrationRoutes(
        createDependencies(fixture.store, runtimes),
      ),
      "POST",
      "/v1/integrations/instagram/connect",
      createClaims("user_connect", "publishing.integrations.connect"),
      { returnPath: "/dashboard/studio/publishing/integrations" },
    );
    const authorizationUrl = new URL(
      (response.body as { authorizationUrl: string }).authorizationUrl,
    );

    expect(standaloneCreate).toHaveBeenCalledOnce();
    expect(facebookCreate).not.toHaveBeenCalled();
    expect(authorizationUrl.searchParams.get("redirect_uri")).toBe(
      `${publicOrigin}/api/studio/publishing/oauth/instagram/callback`,
    );
  });

  it("rejects a disabled public provider before issuing OAuth state", async () => {
    const fixture = createStore();
    const mismatchedCreate = vi.fn(
      () => "https://www.facebook.com/v24.0/dialog/oauth",
    );
    const routes = createPublishingIntegrationRoutes(
      createDependencies(
        fixture.store,
        new Map<PublishingProvider, PublishingIntegrationRuntime>([
          [
            "tiktok",
            {
              id: "instagram",
              createAuthorizationUrl: mismatchedCreate,
              exchangeAuthorizationCode: async () => connection("instagram"),
              listInstagramAccounts: async () => [],
            },
          ],
        ]),
      ),
    );

    await expect(
      invokeRoute(
        routes,
        "POST",
        "/v1/integrations/tiktok/connect",
        createClaims("user_disabled", "publishing.integrations.connect"),
        { returnPath: "/dashboard/studio/publishing/integrations" },
      ),
    ).rejects.toMatchObject({ status: 404, code: "provider_unavailable" });
    expect(mismatchedCreate).not.toHaveBeenCalled();
  });

  it("discovers and saves every eligible Facebook Instagram account as one batch", async () => {
    const fixture = createStore();
    const facebookRuntime: PublishingIntegrationRuntime = {
      id: "instagram",
      createAuthorizationUrl(state, redirectUri) {
        const url = new URL("https://www.facebook.com/v24.0/dialog/oauth");
        url.searchParams.set("client_id", "facebook-client");
        url.searchParams.set("state", state);
        url.searchParams.set("redirect_uri", redirectUri);
        return url.toString();
      },
      exchangeAuthorizationCode: vi.fn(async () => connection("instagram", "facebook-user")),
      listInstagramAccounts: vi.fn(async () => [
        {
          accountId: "ig-account-one",
          pageId: "page-one",
          accountName: "North studio",
          username: "north",
          pictureUrl: undefined,
          pageAccessToken: "page-token-one-private",
        },
        {
          accountId: "ig-account-two",
          pageId: "page-two",
          accountName: "South studio",
          username: "south",
          pictureUrl: undefined,
          pageAccessToken: "page-token-two-private",
        },
      ]),
    };
    const dependencies = createDependencies(
      fixture.store,
      new Map([["instagram", facebookRuntime]]),
    );
    const routes = createPublishingIntegrationRoutes(dependencies);
    const claims = createClaims(
      "user_callback",
      "publishing.integrations.connect",
      "org_brand",
    );
    const start = await invokeRoute(
      routes,
      "POST",
      "/v1/integrations/instagram/connect",
      claims,
      { returnPath: "/dashboard/studio/publishing/integrations" },
    );
    const state = new URL(
      (start.body as { authorizationUrl: string }).authorizationUrl,
    ).searchParams.get("state") as string;
    const callback = await invokeRoute(
      routes,
      "POST",
      "/v1/integrations/instagram/callback",
      createClaims(
        "user_callback",
        "publishing.integrations.callback",
        "org_brand",
      ),
      { code: "provider-code-private", state },
    );

    expect(callback.body).toEqual({ connectedCount: 2, outcome: "connected" });
    expect(fixture.savedConnections).toHaveLength(1);
    expect(fixture.savedConnections[0]?.map(({ accountId }) => accountId)).toEqual([
      "ig-account-one",
      "ig-account-two",
    ]);
    expect(JSON.stringify(callback.body)).not.toContain("provider-code-private");
    expect(JSON.stringify(callback.body)).not.toContain(state);
    expect(JSON.stringify(callback.body)).not.toContain("page-token");
  });

  it("consumes a provider denial before returning the cancelled outcome", async () => {
    const fixture = createStore();
    const exchange = vi.fn(async () => connection("tiktok"));
    const runtime: PublishingIntegrationRuntime = {
      id: "tiktok",
      createAuthorizationUrl(state, redirectUri) {
        const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
        url.searchParams.set("state", state);
        url.searchParams.set("redirect_uri", redirectUri);
        return url.toString();
      },
      exchangeAuthorizationCode: exchange,
      refreshConnection: async () => connection("tiktok"),
      getCreatorInfo: async () => {
        throw new TypeError("Not used.");
      },
    };
    const routes = createPublishingIntegrationRoutes(
      createDependencies(fixture.store, new Map([["tiktok", runtime]])),
    );
    const started = await invokeRoute(
      routes,
      "POST",
      "/v1/integrations/tiktok/connect",
      createClaims("user_denied", "publishing.integrations.connect"),
      { returnPath: "/dashboard/studio/publishing/integrations" },
    );
    const state = new URL(
      (started.body as { authorizationUrl: string }).authorizationUrl,
    ).searchParams.get("state") as string;
    const claims = createClaims(
      "user_denied",
      "publishing.integrations.callback",
    );

    await expect(
      invokeRoute(
        routes,
        "POST",
        "/v1/integrations/tiktok/callback",
        claims,
        { denied: true, state },
      ),
    ).resolves.toMatchObject({ body: { outcome: "cancelled" } });
    await expect(
      invokeRoute(
        routes,
        "POST",
        "/v1/integrations/tiktok/callback",
        claims,
        { denied: true, state },
      ),
    ).rejects.toMatchObject({ status: 400, code: "authorization_failed" });
    expect(exchange).not.toHaveBeenCalled();
    expect(fixture.savedConnections).toHaveLength(0);
  });

  it("consumes mismatched state once and blocks replay across tenants", async () => {
    const fixture = createStore();
    const exchange = vi.fn(async () => connection("tiktok"));
    const tiktokRuntime: PublishingIntegrationRuntime = {
      id: "tiktok",
      createAuthorizationUrl(state, redirectUri) {
        const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
        url.searchParams.set("client_key", "tiktok-client");
        url.searchParams.set("state", state);
        url.searchParams.set("redirect_uri", redirectUri);
        return url.toString();
      },
      exchangeAuthorizationCode: exchange,
      refreshConnection: async () => connection("tiktok"),
      getCreatorInfo: async () => {
        throw new TypeError("Not used.");
      },
    };
    const routes = createPublishingIntegrationRoutes(
      createDependencies(fixture.store, new Map([["tiktok", tiktokRuntime]])),
    );
    const start = await invokeRoute(
      routes,
      "POST",
      "/v1/integrations/tiktok/connect",
      createClaims("user_owner", "publishing.integrations.connect"),
      { returnPath: "/dashboard/studio/publishing/integrations" },
    );
    const state = new URL(
      (start.body as { authorizationUrl: string }).authorizationUrl,
    ).searchParams.get("state") as string;
    const callbackBody = { code: "private-code", state };

    await expect(
      invokeRoute(
        routes,
        "POST",
        "/v1/integrations/tiktok/callback",
        createClaims("user_attacker", "publishing.integrations.callback"),
        callbackBody,
      ),
    ).rejects.toMatchObject({ status: 400, code: "authorization_failed" });
    await expect(
      invokeRoute(
        routes,
        "POST",
        "/v1/integrations/tiktok/callback",
        createClaims("user_owner", "publishing.integrations.callback"),
        callbackBody,
      ),
    ).rejects.toMatchObject({ status: 400, code: "authorization_failed" });
    expect(exchange).not.toHaveBeenCalled();
    expect(fixture.savedConnections).toHaveLength(0);
  });

  it("enforces tenant ownership before refresh, disconnect, and creator info", async () => {
    const fixture = createStore();
    const creatorInfo = vi.fn(async () => ({
      commentsDisabled: false,
      duetDisabled: false,
      fetchedAtEpochMilliseconds: Date.now(),
      maxVideoDurationSeconds: 180,
      nickname: "Creator",
      privacyLevelOptions: Object.freeze(["SELF_ONLY"]),
      stitchDisabled: false,
      username: "creator",
    }));
    const runtime: PublishingIntegrationRuntime = {
      id: "tiktok",
      createAuthorizationUrl: () => "https://www.tiktok.com/v2/auth/authorize/",
      exchangeAuthorizationCode: async () => connection("tiktok"),
      refreshConnection: async () => connection("tiktok"),
      getCreatorInfo: creatorInfo,
    };
    const routes = createPublishingIntegrationRoutes(
      createDependencies(fixture.store, new Map([["tiktok", runtime]])),
    );
    const claims = createClaims("user_owner", "publishing.integrations.refresh");

    await expect(
      invokeRoute(
        routes,
        "POST",
        "/v1/integrations/foreign-id/refresh",
        claims,
      ),
    ).rejects.toMatchObject({ status: 404, code: "integration_not_found" });
    await expect(
      invokeRoute(
        routes,
        "DELETE",
        "/v1/integrations/foreign-id",
        createClaims("user_owner", "publishing.integrations.disconnect"),
      ),
    ).rejects.toMatchObject({ status: 404, code: "integration_not_found" });
    await expect(
      invokeRoute(
        routes,
        "GET",
        "/v1/integrations/tiktok/creator-info",
        createClaims("user_owner", "publishing.status.poll"),
        undefined,
        "integrationId=foreign-id",
      ),
    ).rejects.toMatchObject({ status: 404, code: "integration_not_found" });
    expect(creatorInfo).not.toHaveBeenCalled();
  });

  it("returns a generic server error without echoing secret failures", async () => {
    const fixture = createStore();
    vi.mocked(fixture.store.list).mockRejectedValueOnce(
      new Error("accessToken=top-secret&state=private-state"),
    );
    const routes = createPublishingIntegrationRoutes(
      createDependencies(
        fixture.store,
        new Map<PublishingProvider, PublishingIntegrationRuntime>(),
      ),
    );
    const server = createServer(
      createPublishingServiceRequestHandler({
        authentication: {
          audience: "publishing-service",
          issuer: "clipstitchr-web",
          replayProtector: new InMemoryServiceAssertionReplayProtector(),
          signingKey,
        },
        rateLimiter: {
          consume: async ({ action }) => ({
            action,
            allowed: true,
            observedAtEpochMilliseconds: Date.now(),
            retryAfterSeconds: 0,
            global: { remaining: 99, resetAtEpochMilliseconds: Date.now() + 60_000 },
            tenant: { remaining: 99, resetAtEpochMilliseconds: Date.now() + 60_000 },
          }),
        },
        readinessDependencies: [],
        routes,
        studioBetaEnabled: true,
      }),
    );
    server.listen(0, "127.0.0.1");
    await once(server, "listening");

    try {
      const address = server.address();
      if (address === null || typeof address === "string") {
        throw new TypeError("Expected an IP listener.");
      }
      const requestId = "request-redaction-test";
      const assertion = issueServiceAssertion({
        action: "publishing.integrations.read",
        audience: "publishing-service",
        identity: resolveClerkTenantIdentity({ actorUserId: "user_redaction" }),
        issuer: "clipstitchr-web",
        requestId,
        signingKey,
      });
      const response = await fetch(
        `http://127.0.0.1:${address.port}/v1/integrations`,
        {
          headers: {
            Authorization: `Bearer ${assertion}`,
            "X-ClipStitchr-Request-Id": requestId,
          },
        },
      );
      const text = await response.text();

      expect(response.status).toBe(500);
      expect(text).not.toContain("top-secret");
      expect(text).not.toContain("private-state");
      expect(text).toContain("internal_error");
    } finally {
      server.close();
      await once(server, "close");
    }
  });
});
