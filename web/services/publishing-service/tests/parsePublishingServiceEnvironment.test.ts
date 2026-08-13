import { describe, expect, it } from "vitest";

import { parsePublishingServiceEnvironment } from "../src/config/parsePublishingServiceEnvironment.js";
import { PublishingServiceConfigurationError } from "../src/errors/PublishingServiceConfigurationError.js";

const completeProductionEnvironment = (): NodeJS.ProcessEnv => ({
  NODE_ENV: "production",
  STUDIO_BETA_ENABLED: "true",
  STUDIO_PUBLISHING_SERVICE_HOST: "0.0.0.0",
  STUDIO_PUBLISHING_SERVICE_PORT: "3202",
  STUDIO_PUBLISHING_SERVICE_ISSUER: "clipstitchr-web",
  STUDIO_PUBLISHING_SERVICE_AUDIENCE: "clipstitchr-publishing-service",
  STUDIO_PUBLISHING_SERVICE_ASSERTION_KEY_BASE64: Buffer.alloc(32, 1).toString("base64"),
  STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET:
    "dispatch-access-secret-placeholder-2026",
  STUDIO_PUBLISHING_TOKEN_KEY_ID: "primary-2026-08",
  STUDIO_PUBLISHING_TOKEN_KEY_BASE64: Buffer.alloc(32, 2).toString("base64"),
  STUDIO_PUBLISHING_DATABASE_URL: "postgresql://publishing.invalid/clipstitchr",
  STUDIO_PUBLISHING_REDIS_URL: "rediss://redis.invalid/0",
  STUDIO_PUBLISHING_REDIS_NAMESPACE: "clipstitchr-production",
  STUDIO_PUBLISHING_APP_ORIGIN: "https://clipstitchr.invalid",
  STUDIO_PUBLISHING_SERVICE_ORIGIN: "https://publishing.internal.invalid",
  STUDIO_PUBLISHING_ENABLED_PROVIDERS: "instagram,tiktok",
  STUDIO_PUBLISHING_META_GRAPH_API_VERSION: "v26.0",
  STUDIO_PUBLISHING_META_APP_ID: "facebook-app",
  STUDIO_PUBLISHING_META_APP_SECRET: "facebook-secret-placeholder",
  STUDIO_PUBLISHING_INSTAGRAM_APP_ID: "instagram-app",
  STUDIO_PUBLISHING_INSTAGRAM_APP_SECRET: "instagram-secret-placeholder",
  STUDIO_PUBLISHING_TIKTOK_CLIENT_ID: "tiktok-client",
  STUDIO_PUBLISHING_TIKTOK_CLIENT_SECRET: "tiktok-secret-placeholder",
  STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN: "https://media.clipstitchr.invalid",
  STUDIO_PUBLISHING_R2_ACCOUNT_ID: "r2-account",
  STUDIO_PUBLISHING_R2_BUCKET_NAME: "clipstitchr-media",
  STUDIO_PUBLISHING_R2_ACCESS_KEY_ID: "r2-access-key",
  STUDIO_PUBLISHING_R2_SECRET_ACCESS_KEY: "r2-secret-access-key-placeholder",
  STUDIO_PUBLISHING_MEDIA_PUBLIC_ORIGIN: "https://media.clipstitchr.invalid",
  STUDIO_PUBLISHING_MEDIA_TOKEN_SECRET:
    "publishing-media-token-secret-placeholder-v1",
  STUDIO_PUBLISHING_MEDIA_QUOTA_SECRET:
    "publishing-media-quota-secret-placeholder-v1",
});

describe("parsePublishingServiceEnvironment", () => {
  it("requires an explicit runtime mode instead of assuming development", () => {
    expect(() => parsePublishingServiceEnvironment({})).toThrow(
      new PublishingServiceConfigurationError("NODE_ENV"),
    );
  });

  it("fails closed when production infrastructure is absent", () => {
    expect(() => parsePublishingServiceEnvironment({ NODE_ENV: "production" })).toThrow(
      new PublishingServiceConfigurationError("STUDIO_PUBLISHING_ENABLED_PROVIDERS"),
    );
  });

  it("accepts a complete production contract", () => {
    const configuration = parsePublishingServiceEnvironment(
      completeProductionEnvironment(),
    );

    expect(configuration.mode).toBe("production");
    expect(configuration.studioBetaEnabled).toBe(true);
    expect(configuration.port).toBe(3_202);
    expect(configuration.databaseUrl).toBe(
      "postgresql://publishing.invalid/clipstitchr",
    );
    expect(configuration.serviceAssertionSigningKey?.type).toBe("secret");
    expect(configuration.dispatchAccessSecret).toBe(
      "dispatch-access-secret-placeholder-2026",
    );
    expect(configuration.providerTokenCipherKey?.purpose).toBe(
      "provider-token-encryption",
    );
    expect(configuration.redisSecurityNamespace).toBe("clipstitchr-production");
    expect(configuration.outboxPollMilliseconds).toBe(1_000);
    expect(configuration.outboxLeaseMilliseconds).toBe(120_000);
    expect(configuration.outboxLeaseLimit).toBe(20);
    expect(configuration.outboxConcurrency).toBe(4);
    expect(configuration.enabledProviders).toEqual(["instagram", "tiktok"]);
    expect(configuration.metaGraphVersion).toBe("v26.0");
    expect(configuration.facebookAppId).toBe("facebook-app");
    expect(configuration.instagramAppId).toBeUndefined();
    expect(configuration.instagramAppSecret).toBeUndefined();
    expect(configuration.tikTokVerifiedMediaOrigin).toBe(
      "https://media.clipstitchr.invalid",
    );
    expect(configuration.r2BucketName).toBe("clipstitchr-media");
    expect(configuration.publishingMediaPublicOrigin).toBe(
      "https://media.clipstitchr.invalid",
    );
    expect(Object.isFrozen(configuration)).toBe(true);
  });

  it.each([
    ["STUDIO_PUBLISHING_APP_ORIGIN", "http://clipstitchr.invalid"],
    [
      "STUDIO_PUBLISHING_MEDIA_PUBLIC_ORIGIN",
      "http://media.clipstitchr.invalid",
    ],
    [
      "STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN",
      "http://media.clipstitchr.invalid",
    ],
  ])("requires HTTPS for production origin %s", (fieldName, value) => {
    const environment = completeProductionEnvironment();
    environment[fieldName] = value;

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError(fieldName),
    );
  });

  it("requires encrypted Redis transport in production", () => {
    const environment = completeProductionEnvironment();
    environment["STUDIO_PUBLISHING_REDIS_URL"] = "redis://redis.invalid/0";

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError("STUDIO_PUBLISHING_REDIS_URL"),
    );
  });

  it("permits loopback HTTP and Redis during local development", () => {
    const configuration = parsePublishingServiceEnvironment({
      NODE_ENV: "development",
      STUDIO_PUBLISHING_APP_ORIGIN: "http://localhost:3000",
      STUDIO_PUBLISHING_ENABLED_PROVIDERS: "tiktok",
      STUDIO_PUBLISHING_MEDIA_PUBLIC_ORIGIN: "http://127.0.0.1:3000",
      STUDIO_PUBLISHING_REDIS_URL: "redis://localhost:6379/0",
      STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN:
        "http://127.0.0.1:3000",
    });

    expect(configuration.clipStitchrPublicOrigin).toBe("http://localhost:3000");
    expect(configuration.redisUrl).toBe("redis://localhost:6379/0");
  });

  it("rejects non-loopback HTTP origins during development", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "development",
        STUDIO_PUBLISHING_APP_ORIGIN: "http://development.invalid",
      }),
    ).toThrow(
      new PublishingServiceConfigurationError("STUDIO_PUBLISHING_APP_ORIGIN"),
    );
  });

  it("requires an explicit production Redis namespace", () => {
    const environment = completeProductionEnvironment();
    delete environment["STUDIO_PUBLISHING_REDIS_NAMESPACE"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError("STUDIO_PUBLISHING_REDIS_NAMESPACE"),
    );
  });

  it("requires an explicit production provider allowlist", () => {
    const environment = completeProductionEnvironment();
    delete environment["STUDIO_PUBLISHING_ENABLED_PROVIDERS"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError("STUDIO_PUBLISHING_ENABLED_PROVIDERS"),
    );
  });

  it.each(["tiktok", "instagram", "instagram-standalone"])(
    "rejects an incomplete production provider set: %s",
    (enabledProviders) => {
      const environment = completeProductionEnvironment();
      environment["STUDIO_PUBLISHING_ENABLED_PROVIDERS"] = enabledProviders;

      expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
        new PublishingServiceConfigurationError("STUDIO_PUBLISHING_ENABLED_PROVIDERS"),
      );
    },
  );

  it.each(["instagram,vimeo,tiktok", "instagram,tiktok,tiktok"])(
    "rejects an invalid provider allowlist: %s",
    (enabledProviders) => {
      expect(() =>
        parsePublishingServiceEnvironment({
          NODE_ENV: "test",
          STUDIO_PUBLISHING_ENABLED_PROVIDERS: enabledProviders,
        }),
      ).toThrow(
        new PublishingServiceConfigurationError("STUDIO_PUBLISHING_ENABLED_PROVIDERS"),
      );
    },
  );

  it("supports the standalone Instagram path without Facebook credentials", () => {
    const environment = completeProductionEnvironment();
    environment["STUDIO_PUBLISHING_ENABLED_PROVIDERS"] =
      "instagram-standalone,tiktok";
    delete environment["STUDIO_PUBLISHING_META_APP_ID"];
    delete environment["STUDIO_PUBLISHING_META_APP_SECRET"];

    const configuration = parsePublishingServiceEnvironment(environment);

    expect(configuration.enabledProviders).toEqual([
      "instagram-standalone",
      "tiktok",
    ]);
    expect(configuration.facebookAppId).toBeUndefined();
    expect(configuration.instagramAppId).toBe("instagram-app");
  });

  it("requires credentials only for enabled provider paths", () => {
    const environment = completeProductionEnvironment();
    delete environment["STUDIO_PUBLISHING_META_APP_SECRET"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError("STUDIO_PUBLISHING_META_APP_SECRET"),
    );
  });

  it("requires and parses the dedicated Google credentials when YouTube is enabled", () => {
    const environment = completeProductionEnvironment();
    environment["STUDIO_PUBLISHING_ENABLED_PROVIDERS"] =
      "instagram,tiktok,youtube";
    environment["STUDIO_PUBLISHING_GOOGLE_CLIENT_ID"] = "google-client";

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError(
        "STUDIO_PUBLISHING_GOOGLE_CLIENT_SECRET",
      ),
    );

    environment["STUDIO_PUBLISHING_GOOGLE_CLIENT_SECRET"] =
      "google-client-secret-placeholder";
    const configuration = parsePublishingServiceEnvironment(environment);
    expect(configuration.enabledProviders).toEqual([
      "instagram",
      "tiktok",
      "youtube",
    ]);
    expect(configuration.googleClientId).toBe("google-client");
    expect(configuration.googleClientSecret).toBe(
      "google-client-secret-placeholder",
    );
  });

  it("requires TikTok's verified media origin in production", () => {
    const environment = completeProductionEnvironment();
    delete environment["STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError("STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN"),
    );
  });

  it("requires TikTok's verified origin to match the exact media gateway origin", () => {
    const environment = completeProductionEnvironment();
    environment["STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN"] =
      "https://different.clipstitchr.invalid";

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError(
        "STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN",
      ),
    );
  });

  it("requires independent media token and quota secrets", () => {
    const environment = completeProductionEnvironment();
    environment["STUDIO_PUBLISHING_MEDIA_QUOTA_SECRET"] =
      environment["STUDIO_PUBLISHING_MEDIA_TOKEN_SECRET"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError(
        "STUDIO_PUBLISHING_MEDIA_QUOTA_SECRET",
      ),
    );
  });

  it("requires an explicit supported Meta Graph version in production", () => {
    const environment = completeProductionEnvironment();
    delete environment["STUDIO_PUBLISHING_META_GRAPH_API_VERSION"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError("STUDIO_PUBLISHING_META_GRAPH_API_VERSION"),
    );
  });

  it("rejects an unversioned Meta Graph alias", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "test",
        STUDIO_PUBLISHING_ENABLED_PROVIDERS: "instagram",
        STUDIO_PUBLISHING_META_GRAPH_API_VERSION: "latest",
      }),
    ).toThrow(
      new PublishingServiceConfigurationError("STUDIO_PUBLISHING_META_GRAPH_API_VERSION"),
    );
  });

  it("permits isolated development without inventing credential fallbacks", () => {
    const configuration = parsePublishingServiceEnvironment({ NODE_ENV: "development" });

    expect(configuration.host).toBe("127.0.0.1");
    expect(configuration.port).toBe(3_202);
    expect(configuration.serviceAssertionSigningKey).toBeUndefined();
    expect(configuration.dispatchAccessSecret).toBeUndefined();
    expect(configuration.providerTokenCipherKey).toBeUndefined();
    expect(configuration.databaseUrl).toBeUndefined();
    expect(configuration.studioBetaEnabled).toBe(false);
  });

  it("requires the dedicated production dispatch-access secret", () => {
    const environment = completeProductionEnvironment();
    delete environment["STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError(
        "STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET",
      ),
    );
  });

  it("rejects a short dispatch-access secret without echoing it", () => {
    const invalidSecret = "short";

    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "development",
        STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET: invalidSecret,
      }),
    ).toThrow(
      new PublishingServiceConfigurationError(
        "STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET",
      ),
    );
  });

  it("rejects reuse of another publishing secret for dispatch access", () => {
    const environment = completeProductionEnvironment();
    environment["STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET"] =
      environment["STUDIO_PUBLISHING_SERVICE_ASSERTION_KEY_BASE64"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError(
        "STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET",
      ),
    );
  });

  it.each(["false", "TRUE", " true", "true "])(
    "keeps Studio Beta off unless the value is exactly true: %s",
    (studioBetaEnabled) => {
      const configuration = parsePublishingServiceEnvironment({
        NODE_ENV: "development",
        STUDIO_BETA_ENABLED: studioBetaEnabled,
      });

      expect(configuration.studioBetaEnabled).toBe(false);
    },
  );

  it("rejects malformed supplied values in development", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "development",
        STUDIO_PUBLISHING_DATABASE_URL: "https://not-postgres.invalid",
      }),
    ).toThrow(new PublishingServiceConfigurationError("STUDIO_PUBLISHING_DATABASE_URL"));
  });

  it("rejects scheduler concurrency larger than its lease batch", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "development",
        STUDIO_PUBLISHING_OUTBOX_LEASE_LIMIT: "3",
        STUDIO_PUBLISHING_OUTBOX_CONCURRENCY: "4",
      }),
    ).toThrow(
      new PublishingServiceConfigurationError(
        "STUDIO_PUBLISHING_OUTBOX_CONCURRENCY",
      ),
    );
  });

  it("rejects malformed supplied provider secrets without echoing them", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "development",
        STUDIO_PUBLISHING_ENABLED_PROVIDERS: "tiktok",
        STUDIO_PUBLISHING_TIKTOK_CLIENT_SECRET: "short",
      }),
    ).toThrow(new PublishingServiceConfigurationError("STUDIO_PUBLISHING_TIKTOK_CLIENT_SECRET"));
  });

  it("ignores credentials for disabled provider paths", () => {
    const configuration = parsePublishingServiceEnvironment({
      NODE_ENV: "development",
      STUDIO_PUBLISHING_ENABLED_PROVIDERS: "instagram",
      STUDIO_PUBLISHING_TIKTOK_CLIENT_SECRET: "short",
    });

    expect(configuration.tikTokClientSecret).toBeUndefined();
  });

  it("requires token key configuration as an atomic pair", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "test",
        STUDIO_PUBLISHING_TOKEN_KEY_ID: "primary",
      }),
    ).toThrow(
      new PublishingServiceConfigurationError("STUDIO_PUBLISHING_TOKEN_KEY_BASE64"),
    );
  });

  it("rejects an unsafe Redis namespace", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "test",
        STUDIO_PUBLISHING_REDIS_NAMESPACE: "shared/production",
      }),
    ).toThrow(
      new PublishingServiceConfigurationError("STUDIO_PUBLISHING_REDIS_NAMESPACE"),
    );
  });

  it("rejects reuse of the service assertion key for token encryption", () => {
    const sharedKey = Buffer.alloc(32, 7).toString("base64");

    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "test",
        STUDIO_PUBLISHING_SERVICE_ASSERTION_KEY_BASE64: sharedKey,
        STUDIO_PUBLISHING_TOKEN_KEY_ID: "primary",
        STUDIO_PUBLISHING_TOKEN_KEY_BASE64: sharedKey,
      }),
    ).toThrow(
      new PublishingServiceConfigurationError("STUDIO_PUBLISHING_TOKEN_KEY_BASE64"),
    );
  });

  it("never includes an invalid secret value in its error", () => {
    const invalidSecret = "do-not-echo-this-value";

    try {
      parsePublishingServiceEnvironment({
        NODE_ENV: "test",
        STUDIO_PUBLISHING_SERVICE_ASSERTION_KEY_BASE64: invalidSecret,
      });
      throw new Error("Expected configuration parsing to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(PublishingServiceConfigurationError);
      expect((error as Error).message).not.toContain(invalidSecret);
    }
  });
});
