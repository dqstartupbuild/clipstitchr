import { describe, expect, it } from "vitest";

import { parsePublishingServiceEnvironment } from "../src/config/parsePublishingServiceEnvironment.js";
import { PublishingServiceConfigurationError } from "../src/errors/PublishingServiceConfigurationError.js";

const completeProductionEnvironment = (): NodeJS.ProcessEnv => ({
  NODE_ENV: "production",
  PUBLISHING_SERVICE_HOST: "0.0.0.0",
  PUBLISHING_SERVICE_PORT: "3202",
  PUBLISHING_SERVICE_ISSUER: "clipstitchr-web",
  PUBLISHING_SERVICE_AUDIENCE: "clipstitchr-publishing-service",
  PUBLISHING_SERVICE_ASSERTION_KEY_BASE64: Buffer.alloc(32, 1).toString("base64"),
  PUBLISHING_TOKEN_KEY_ID: "primary-2026-08",
  PUBLISHING_TOKEN_KEY_BASE64: Buffer.alloc(32, 2).toString("base64"),
  DATABASE_URL: "postgresql://publishing.invalid/clipstitchr",
  REDIS_URL: "rediss://redis.invalid/0",
  PUBLISHING_REDIS_NAMESPACE: "clipstitchr-production",
  CLIPSTITCHR_PUBLIC_ORIGIN: "https://clipstitchr.invalid",
  PUBLISHING_SERVICE_ORIGIN: "https://publishing.internal.invalid",
  PUBLISHING_ENABLED_PROVIDERS: "instagram,tiktok",
  META_GRAPH_API_VERSION: "v26.0",
  FACEBOOK_APP_ID: "facebook-app",
  FACEBOOK_APP_SECRET: "facebook-secret-placeholder",
  INSTAGRAM_APP_ID: "instagram-app",
  INSTAGRAM_APP_SECRET: "instagram-secret-placeholder",
  TIKTOK_CLIENT_ID: "tiktok-client",
  TIKTOK_CLIENT_SECRET: "tiktok-secret-placeholder",
  TIKTOK_VERIFIED_MEDIA_ORIGIN: "https://media.clipstitchr.invalid",
  R2_ACCOUNT_ID: "r2-account",
  R2_BUCKET_NAME: "clipstitchr-media",
  R2_ACCESS_KEY_ID: "r2-access-key",
  R2_SECRET_ACCESS_KEY: "r2-secret-access-key-placeholder",
  PUBLISHING_MEDIA_PUBLIC_ORIGIN: "https://media.clipstitchr.invalid",
  PUBLISHING_MEDIA_TOKEN_SECRET:
    "publishing-media-token-secret-placeholder-v1",
  PUBLISHING_MEDIA_QUOTA_SECRET:
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
      new PublishingServiceConfigurationError("PUBLISHING_ENABLED_PROVIDERS"),
    );
  });

  it("accepts a complete production contract", () => {
    const configuration = parsePublishingServiceEnvironment(
      completeProductionEnvironment(),
    );

    expect(configuration.mode).toBe("production");
    expect(configuration.port).toBe(3_202);
    expect(configuration.databaseUrl).toBe(
      "postgresql://publishing.invalid/clipstitchr",
    );
    expect(configuration.serviceAssertionSigningKey?.type).toBe("secret");
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

  it("requires an explicit production Redis namespace", () => {
    const environment = completeProductionEnvironment();
    delete environment["PUBLISHING_REDIS_NAMESPACE"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError("PUBLISHING_REDIS_NAMESPACE"),
    );
  });

  it("requires an explicit production provider allowlist", () => {
    const environment = completeProductionEnvironment();
    delete environment["PUBLISHING_ENABLED_PROVIDERS"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError("PUBLISHING_ENABLED_PROVIDERS"),
    );
  });

  it.each(["tiktok", "instagram", "instagram-standalone"])(
    "rejects an incomplete production provider set: %s",
    (enabledProviders) => {
      const environment = completeProductionEnvironment();
      environment["PUBLISHING_ENABLED_PROVIDERS"] = enabledProviders;

      expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
        new PublishingServiceConfigurationError("PUBLISHING_ENABLED_PROVIDERS"),
      );
    },
  );

  it.each(["instagram,youtube,tiktok", "instagram,tiktok,tiktok"])(
    "rejects an invalid provider allowlist: %s",
    (enabledProviders) => {
      expect(() =>
        parsePublishingServiceEnvironment({
          NODE_ENV: "test",
          PUBLISHING_ENABLED_PROVIDERS: enabledProviders,
        }),
      ).toThrow(
        new PublishingServiceConfigurationError("PUBLISHING_ENABLED_PROVIDERS"),
      );
    },
  );

  it("supports the standalone Instagram path without Facebook credentials", () => {
    const environment = completeProductionEnvironment();
    environment["PUBLISHING_ENABLED_PROVIDERS"] =
      "instagram-standalone,tiktok";
    delete environment["FACEBOOK_APP_ID"];
    delete environment["FACEBOOK_APP_SECRET"];

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
    delete environment["FACEBOOK_APP_SECRET"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError("FACEBOOK_APP_SECRET"),
    );
  });

  it("requires TikTok's verified media origin in production", () => {
    const environment = completeProductionEnvironment();
    delete environment["TIKTOK_VERIFIED_MEDIA_ORIGIN"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError("TIKTOK_VERIFIED_MEDIA_ORIGIN"),
    );
  });

  it("requires TikTok's verified origin to match the exact media gateway origin", () => {
    const environment = completeProductionEnvironment();
    environment["TIKTOK_VERIFIED_MEDIA_ORIGIN"] =
      "https://different.clipstitchr.invalid";

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError(
        "TIKTOK_VERIFIED_MEDIA_ORIGIN",
      ),
    );
  });

  it("requires independent media token and quota secrets", () => {
    const environment = completeProductionEnvironment();
    environment["PUBLISHING_MEDIA_QUOTA_SECRET"] =
      environment["PUBLISHING_MEDIA_TOKEN_SECRET"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError(
        "PUBLISHING_MEDIA_QUOTA_SECRET",
      ),
    );
  });

  it("requires an explicit supported Meta Graph version in production", () => {
    const environment = completeProductionEnvironment();
    delete environment["META_GRAPH_API_VERSION"];

    expect(() => parsePublishingServiceEnvironment(environment)).toThrow(
      new PublishingServiceConfigurationError("META_GRAPH_API_VERSION"),
    );
  });

  it("rejects an unversioned Meta Graph alias", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "test",
        PUBLISHING_ENABLED_PROVIDERS: "instagram",
        META_GRAPH_API_VERSION: "latest",
      }),
    ).toThrow(
      new PublishingServiceConfigurationError("META_GRAPH_API_VERSION"),
    );
  });

  it("permits isolated development without inventing credential fallbacks", () => {
    const configuration = parsePublishingServiceEnvironment({ NODE_ENV: "development" });

    expect(configuration.host).toBe("127.0.0.1");
    expect(configuration.port).toBe(3_202);
    expect(configuration.serviceAssertionSigningKey).toBeUndefined();
    expect(configuration.providerTokenCipherKey).toBeUndefined();
    expect(configuration.databaseUrl).toBeUndefined();
  });

  it("rejects malformed supplied values in development", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "development",
        DATABASE_URL: "https://not-postgres.invalid",
      }),
    ).toThrow(new PublishingServiceConfigurationError("DATABASE_URL"));
  });

  it("rejects scheduler concurrency larger than its lease batch", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "development",
        PUBLISHING_OUTBOX_LEASE_LIMIT: "3",
        PUBLISHING_OUTBOX_CONCURRENCY: "4",
      }),
    ).toThrow(
      new PublishingServiceConfigurationError(
        "PUBLISHING_OUTBOX_CONCURRENCY",
      ),
    );
  });

  it("rejects malformed supplied provider secrets without echoing them", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "development",
        PUBLISHING_ENABLED_PROVIDERS: "tiktok",
        TIKTOK_CLIENT_SECRET: "short",
      }),
    ).toThrow(new PublishingServiceConfigurationError("TIKTOK_CLIENT_SECRET"));
  });

  it("ignores credentials for disabled provider paths", () => {
    const configuration = parsePublishingServiceEnvironment({
      NODE_ENV: "development",
      PUBLISHING_ENABLED_PROVIDERS: "instagram",
      TIKTOK_CLIENT_SECRET: "short",
    });

    expect(configuration.tikTokClientSecret).toBeUndefined();
  });

  it("requires token key configuration as an atomic pair", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "test",
        PUBLISHING_TOKEN_KEY_ID: "primary",
      }),
    ).toThrow(
      new PublishingServiceConfigurationError("PUBLISHING_TOKEN_KEY_BASE64"),
    );
  });

  it("rejects an unsafe Redis namespace", () => {
    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "test",
        PUBLISHING_REDIS_NAMESPACE: "shared/production",
      }),
    ).toThrow(
      new PublishingServiceConfigurationError("PUBLISHING_REDIS_NAMESPACE"),
    );
  });

  it("rejects reuse of the service assertion key for token encryption", () => {
    const sharedKey = Buffer.alloc(32, 7).toString("base64");

    expect(() =>
      parsePublishingServiceEnvironment({
        NODE_ENV: "test",
        PUBLISHING_SERVICE_ASSERTION_KEY_BASE64: sharedKey,
        PUBLISHING_TOKEN_KEY_ID: "primary",
        PUBLISHING_TOKEN_KEY_BASE64: sharedKey,
      }),
    ).toThrow(
      new PublishingServiceConfigurationError("PUBLISHING_TOKEN_KEY_BASE64"),
    );
  });

  it("never includes an invalid secret value in its error", () => {
    const invalidSecret = "do-not-echo-this-value";

    try {
      parsePublishingServiceEnvironment({
        NODE_ENV: "test",
        PUBLISHING_SERVICE_ASSERTION_KEY_BASE64: invalidSecret,
      });
      throw new Error("Expected configuration parsing to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(PublishingServiceConfigurationError);
      expect((error as Error).message).not.toContain(invalidSecret);
    }
  });
});
