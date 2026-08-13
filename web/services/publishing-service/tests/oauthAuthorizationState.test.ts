import { describe, expect, it } from "vitest";

import { OAuthAuthorizationStateError } from "../src/errors/OAuthAuthorizationStateError.js";
import { resolveClerkTenantIdentity } from "../src/identity/resolveClerkTenantIdentity.js";
import { RedisOAuthAuthorizationStateStore } from "../src/oauth/RedisOAuthAuthorizationStateStore.js";
import { consumeOAuthAuthorizationRequestState } from "../src/oauth/consumeOAuthAuthorizationRequestState.js";
import { createOAuthAuthorizationRequestState } from "../src/oauth/createOAuthAuthorizationRequestState.js";
import { createPkceCodeChallenge } from "../src/oauth/createPkceCodeChallenge.js";
import type { OAuthAuthorizationStateIssueInput } from "../src/oauth/OAuthAuthorizationStateIssueInput.js";
import { InMemoryRedisStringCommands } from "./support/InMemoryRedisStringCommands.js";
import { createRedisSecurityNamespace } from "../src/redis/createRedisSecurityNamespace.js";

const NOW = 1_785_600_000_000;
const PUBLIC_ORIGIN = "https://clipstitchr.invalid";
const REDIRECT_URI =
  "https://clipstitchr.invalid/api/studio/publishing/oauth/tiktok/callback";
const NAMESPACE = createRedisSecurityNamespace("production");
const identity = resolveClerkTenantIdentity({
  actorUserId: "user_member_123",
  activeOrganizationId: "org_brand_456",
});

const createStateFixture = async () => {
  const commands = new InMemoryRedisStringCommands(() => NOW);
  const store = new RedisOAuthAuthorizationStateStore(commands, NAMESPACE);
  const authorizationState = await createOAuthAuthorizationRequestState({
    identity,
    provider: "tiktok",
    pkceMode: "none",
    publicOrigin: PUBLIC_ORIGIN,
    returnPath: "/dashboard/studio/publishing/integrations",
    store,
    nowEpochMilliseconds: NOW,
  });

  return { authorizationState, commands, store };
};

describe("OAuth authorization request state", () => {
  it("creates 256-bit state without implying PKCE for the TikTok web flow", async () => {
    const { authorizationState, commands } = await createStateFixture();

    expect(Buffer.from(authorizationState.state, "base64url")).toHaveLength(32);
    expect(authorizationState.pkceMode).toBe("none");
    expect(authorizationState).not.toHaveProperty("codeChallenge");
    expect(authorizationState).not.toHaveProperty("codeChallengeMethod");
    expect(authorizationState.redirectUri).toBe(REDIRECT_URI);
    expect(authorizationState.expiresAtEpochMilliseconds).toBe(NOW + 300_000);
    expect(commands.setCalls).toHaveLength(1);
    expect(commands.setCalls[0]?.options).toEqual({ NX: true, PX: 300_000 });
    expect(commands.setCalls[0]?.key).toMatch(
      /^clipstitchr:production:oauth-authorization-state:v1:[A-Za-z0-9_-]{43}$/,
    );
    expect(commands.setCalls[0]?.key).not.toContain(authorizationState.state);
    expect(commands.setCalls[0]?.value).not.toContain(authorizationState.state);
  });

  it("constructs the callback from the configured origin and ignores callback input", async () => {
    const commands = new InMemoryRedisStringCommands(() => NOW);
    const store = new RedisOAuthAuthorizationStateStore(commands, NAMESPACE);
    const input: OAuthAuthorizationStateIssueInput & { redirectUri: string } = {
      identity,
      provider: "tiktok",
      pkceMode: "none",
      publicOrigin: PUBLIC_ORIGIN,
      redirectUri: "https://attacker.invalid/callback",
      returnPath: "/dashboard/studio/publishing/integrations",
      store,
      nowEpochMilliseconds: NOW,
    };

    await expect(createOAuthAuthorizationRequestState(input)).resolves.toMatchObject({
      redirectUri: REDIRECT_URI,
    });
    expect(commands.setCalls[0]?.value).not.toContain("attacker.invalid");
  });

  it("atomically consumes web state without inventing a verifier", async () => {
    const { authorizationState, store } = await createStateFixture();
    const consumed = await consumeOAuthAuthorizationRequestState({
      state: authorizationState.state,
      expectedIdentity: identity,
      expectedProvider: "tiktok",
      expectedPkceMode: "none",
      expectedPublicOrigin: PUBLIC_ORIGIN,
      expectedReturnPath: "/dashboard/studio/publishing/integrations",
      store,
      nowEpochMilliseconds: NOW + 1_000,
    });

    expect(consumed).toMatchObject({
      tenantKey: "clerk-organization:org_brand_456",
      actorUserId: "user_member_123",
      actorOrganizationId: "org_brand_456",
      provider: "tiktok",
      redirectUri: REDIRECT_URI,
      returnPath: "/dashboard/studio/publishing/integrations",
      pkceMode: "none",
    });
    expect(consumed).not.toHaveProperty("codeVerifier");

    await expect(
      consumeOAuthAuthorizationRequestState({
        state: authorizationState.state,
        expectedIdentity: identity,
        expectedProvider: "tiktok",
        expectedPkceMode: "none",
        expectedPublicOrigin: PUBLIC_ORIGIN,
        expectedReturnPath: "/dashboard/studio/publishing/integrations",
        store,
        nowEpochMilliseconds: NOW + 2_000,
      }),
    ).rejects.toMatchObject({ reason: "unavailable" });
  });

  it("issues RFC 7636 S256 only when the provider capability explicitly requests it", async () => {
    const commands = new InMemoryRedisStringCommands(() => NOW);
    const store = new RedisOAuthAuthorizationStateStore(commands, NAMESPACE);
    const authorizationState = await createOAuthAuthorizationRequestState({
      identity,
      provider: "instagram",
      pkceMode: "rfc7636-s256",
      publicOrigin: PUBLIC_ORIGIN,
      returnPath: "/dashboard/studio/publishing/integrations",
      store,
      nowEpochMilliseconds: NOW,
    });

    expect(authorizationState).toMatchObject({
      pkceMode: "rfc7636-s256",
      codeChallenge: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/),
      codeChallengeMethod: "S256",
    });

    if (authorizationState.pkceMode !== "rfc7636-s256") {
      throw new TypeError("Expected the explicit RFC 7636 capability.");
    }

    const consumed = await consumeOAuthAuthorizationRequestState({
      state: authorizationState.state,
      expectedIdentity: identity,
      expectedProvider: "instagram",
      expectedPkceMode: "rfc7636-s256",
      expectedPublicOrigin: PUBLIC_ORIGIN,
      expectedReturnPath: "/dashboard/studio/publishing/integrations",
      store,
      nowEpochMilliseconds: NOW + 1_000,
    });

    if (consumed.pkceMode !== "rfc7636-s256") {
      throw new TypeError("Expected an RFC 7636 verifier.");
    }

    expect(consumed.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(createPkceCodeChallenge(consumed.codeVerifier)).toBe(
      authorizationState.codeChallenge,
    );
  });

  it.each([
    {
      name: "tenant and actor",
      overrides: {
        expectedIdentity: resolveClerkTenantIdentity({ actorUserId: "user_other_999" }),
      },
    },
    {
      name: "provider",
      overrides: { expectedProvider: "instagram" as const },
    },
    {
      name: "PKCE capability",
      overrides: { expectedPkceMode: "rfc7636-s256" as const },
    },
    {
      name: "configured public origin",
      overrides: {
        expectedPublicOrigin: "https://another-deployment.invalid",
      },
    },
    {
      name: "return path",
      overrides: { expectedReturnPath: "/dashboard/studio/publishing/compose" as const },
    },
  ])("rejects and consumes a mismatched $name binding", async ({ overrides }) => {
    const { authorizationState, store } = await createStateFixture();
    const expected = {
      state: authorizationState.state,
      expectedIdentity: identity,
      expectedProvider: "tiktok" as const,
      expectedPkceMode: "none" as const,
      expectedPublicOrigin: PUBLIC_ORIGIN,
      expectedReturnPath: "/dashboard/studio/publishing/integrations" as const,
      store,
      nowEpochMilliseconds: NOW + 1_000,
      ...overrides,
    };

    await expect(
      consumeOAuthAuthorizationRequestState(expected),
    ).rejects.toMatchObject({ reason: "binding" });
    await expect(
      consumeOAuthAuthorizationRequestState({
        state: authorizationState.state,
        expectedIdentity: identity,
        expectedProvider: "tiktok",
        expectedPkceMode: "none",
        expectedPublicOrigin: PUBLIC_ORIGIN,
        expectedReturnPath: "/dashboard/studio/publishing/integrations",
        store,
        nowEpochMilliseconds: NOW + 2_000,
      }),
    ).rejects.toMatchObject({ reason: "unavailable" });
  });

  it("rejects an expired record after atomically consuming it", async () => {
    const { authorizationState, store } = await createStateFixture();

    await expect(
      consumeOAuthAuthorizationRequestState({
        state: authorizationState.state,
        expectedIdentity: identity,
        expectedProvider: "tiktok",
        expectedPkceMode: "none",
        expectedPublicOrigin: PUBLIC_ORIGIN,
        expectedReturnPath: "/dashboard/studio/publishing/integrations",
        store,
        nowEpochMilliseconds: NOW + 300_000,
      }),
    ).rejects.toMatchObject({ reason: "expired" });
  });

  it("uses a race-safe compare-and-delete fallback when GETDEL is unavailable", async () => {
    const commands = new InMemoryRedisStringCommands(() => NOW);
    const fallbackCommands = {
      set: commands.set.bind(commands),
      get: commands.get.bind(commands),
      eval: commands.eval.bind(commands),
    };
    const store = new RedisOAuthAuthorizationStateStore(
      fallbackCommands,
      NAMESPACE,
    );
    const authorizationState = await createOAuthAuthorizationRequestState({
      identity,
      provider: "tiktok",
      pkceMode: "none",
      publicOrigin: PUBLIC_ORIGIN,
      returnPath: "/dashboard/studio/publishing/integrations",
      store,
      nowEpochMilliseconds: NOW,
    });
    const input = {
      state: authorizationState.state,
      expectedIdentity: identity,
      expectedProvider: "tiktok" as const,
      expectedPkceMode: "none" as const,
      expectedPublicOrigin: PUBLIC_ORIGIN,
      expectedReturnPath: "/dashboard/studio/publishing/integrations" as const,
      store,
      nowEpochMilliseconds: NOW + 1_000,
    };
    const results = await Promise.allSettled([
      consumeOAuthAuthorizationRequestState(input),
      consumeOAuthAuthorizationRequestState(input),
    ]);

    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(results.filter(({ status }) => status === "rejected")).toHaveLength(1);
    expect(commands.evalCalls[0]?.script).toContain('redis.call("GET", KEYS[1])');
    expect(commands.evalCalls[0]?.script).toContain('redis.call("DEL", KEYS[1])');
  });

  it("refuses a non-atomic fallback configuration", () => {
    const commands = new InMemoryRedisStringCommands(() => NOW);

    expect(
      () =>
        new RedisOAuthAuthorizationStateStore(
          {
            set: commands.set.bind(commands),
            get: commands.get.bind(commands),
          },
          NAMESPACE,
        ),
    ).toThrow(new OAuthAuthorizationStateError("configuration"));
  });

  it("isolates identical OAuth storage keys by deployment namespace", async () => {
    const commands = new InMemoryRedisStringCommands(() => NOW);
    const production = new RedisOAuthAuthorizationStateStore(
      commands,
      createRedisSecurityNamespace("production"),
    );
    const staging = new RedisOAuthAuthorizationStateStore(
      commands,
      createRedisSecurityNamespace("staging"),
    );
    const logicalKey = `oauth-authorization-state:v1:${"A".repeat(43)}`;

    await expect(production.create(logicalKey, "production-value", 60_000)).resolves.toBe(
      true,
    );
    await expect(staging.create(logicalKey, "staging-value", 60_000)).resolves.toBe(
      true,
    );
    await expect(production.consume(logicalKey)).resolves.toBe("production-value");
    await expect(staging.consume(logicalKey)).resolves.toBe("staging-value");
  });

  it("fails closed and redacts Redis errors", async () => {
    const store = new RedisOAuthAuthorizationStateStore(
      {
        set: async () => {
          throw new Error("redis://user:secret@private.invalid");
        },
        getDel: async () => null,
      },
      NAMESPACE,
    );

    await expect(
      createOAuthAuthorizationRequestState({
        identity,
        provider: "tiktok",
        pkceMode: "none",
        publicOrigin: PUBLIC_ORIGIN,
        returnPath: "/dashboard/studio/publishing/integrations",
        store,
        nowEpochMilliseconds: NOW,
      }),
    ).rejects.toEqual(new OAuthAuthorizationStateError("storage"));
  });

  it("rejects non-HTTPS and off-surface redirect URIs", async () => {
    const commands = new InMemoryRedisStringCommands(() => NOW);
    const store = new RedisOAuthAuthorizationStateStore(commands, NAMESPACE);

    await expect(
      createOAuthAuthorizationRequestState({
        identity,
        provider: "tiktok",
        pkceMode: "none",
        publicOrigin: "http://localhost:3000",
        returnPath: "/dashboard/studio/publishing/integrations",
        store,
        nowEpochMilliseconds: NOW,
      }),
    ).rejects.toMatchObject({ reason: "invalid" });
  });
});
