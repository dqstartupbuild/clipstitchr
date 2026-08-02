import type { PublishingServiceEnvironment } from "./PublishingServiceEnvironment.js";
import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import { assertProductionEnvironmentComplete } from "./assertProductionEnvironmentComplete.js";
import { parseEnvironmentIdentifier } from "./parseEnvironmentIdentifier.js";
import { parseEnvironmentOrigin } from "./parseEnvironmentOrigin.js";
import { parseEnvironmentPort } from "./parseEnvironmentPort.js";
import { parseEnvironmentSecret } from "./parseEnvironmentSecret.js";
import { parseEnvironmentUrl } from "./parseEnvironmentUrl.js";
import { parseOptionalProviderTokenCipherKey } from "./parseOptionalProviderTokenCipherKey.js";
import { parseOptionalServiceAssertionSigningKey } from "./parseOptionalServiceAssertionSigningKey.js";
import { parseOptionalRedisSecurityNamespace } from "./parseOptionalRedisSecurityNamespace.js";
import { parsePublishingServiceRuntimeMode } from "./parsePublishingServiceRuntimeMode.js";
import { readOptionalEnvironmentValue } from "./readOptionalEnvironmentValue.js";
import { parsePublishingEnabledProviders } from "./parsePublishingEnabledProviders.js";
import { assertProductionProviderConfigurationComplete } from "./assertProductionProviderConfigurationComplete.js";
import { parseMetaGraphVersion } from "./parseMetaGraphVersion.js";
import { parseOptionalEnvironmentInteger } from "./parseOptionalEnvironmentInteger.js";
import { assertPublishingOutboxConfiguration } from "./assertPublishingOutboxConfiguration.js";
import { parsePublishingMediaSecret } from "./parsePublishingMediaSecret.js";

const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);
const REDIS_PROTOCOLS = new Set(["redis:", "rediss:"]);

export const parsePublishingServiceEnvironment = (
  input: NodeJS.ProcessEnv,
): PublishingServiceEnvironment => {
  const read = (fieldName: string): string | undefined =>
    readOptionalEnvironmentValue(input, fieldName);
  const mode = parsePublishingServiceRuntimeMode(read("NODE_ENV"));
  const enabledProviders = parsePublishingEnabledProviders(
    read("PUBLISHING_ENABLED_PROVIDERS"),
    mode,
  );
  const encodedServiceAssertionKey = read(
    "PUBLISHING_SERVICE_ASSERTION_KEY_BASE64",
  );
  const encodedProviderTokenKey = read("PUBLISHING_TOKEN_KEY_BASE64");
  const publishingMediaTokenSecret = parsePublishingMediaSecret(
    read("PUBLISHING_MEDIA_TOKEN_SECRET"),
    "PUBLISHING_MEDIA_TOKEN_SECRET",
  );
  const publishingMediaQuotaSecret = parsePublishingMediaSecret(
    read("PUBLISHING_MEDIA_QUOTA_SECRET"),
    "PUBLISHING_MEDIA_QUOTA_SECRET",
  );

  if (
    encodedServiceAssertionKey !== undefined &&
    encodedServiceAssertionKey === encodedProviderTokenKey
  ) {
    throw new PublishingServiceConfigurationError("PUBLISHING_TOKEN_KEY_BASE64");
  }

  if (
    publishingMediaTokenSecret !== undefined &&
    publishingMediaTokenSecret === publishingMediaQuotaSecret
  ) {
    throw new PublishingServiceConfigurationError(
      "PUBLISHING_MEDIA_QUOTA_SECRET",
    );
  }

  const serviceAssertionSigningKey = parseOptionalServiceAssertionSigningKey(
    encodedServiceAssertionKey,
  );
  const providerTokenCipherKey = parseOptionalProviderTokenCipherKey(
    read("PUBLISHING_TOKEN_KEY_ID"),
    encodedProviderTokenKey,
  );

  const environment: PublishingServiceEnvironment = Object.freeze({
    mode,
    host:
      parseEnvironmentIdentifier(
        read("PUBLISHING_SERVICE_HOST"),
        "PUBLISHING_SERVICE_HOST",
      ) ?? (mode === "production" ? undefined : "127.0.0.1"),
    port:
      parseEnvironmentPort(
        read("PUBLISHING_SERVICE_PORT") ?? read("PORT"),
        read("PUBLISHING_SERVICE_PORT") === undefined
          ? "PORT"
          : "PUBLISHING_SERVICE_PORT",
      ) ?? (mode === "production" ? undefined : 3_202),
    serviceIssuer: parseEnvironmentIdentifier(
      read("PUBLISHING_SERVICE_ISSUER"),
      "PUBLISHING_SERVICE_ISSUER",
    ),
    serviceAudience: parseEnvironmentIdentifier(
      read("PUBLISHING_SERVICE_AUDIENCE"),
      "PUBLISHING_SERVICE_AUDIENCE",
    ),
    serviceAssertionSigningKey,
    providerTokenCipherKey,
    databaseUrl: parseEnvironmentUrl(
      read("DATABASE_URL"),
      "DATABASE_URL",
      POSTGRES_PROTOCOLS,
    ),
    redisUrl: parseEnvironmentUrl(read("REDIS_URL"), "REDIS_URL", REDIS_PROTOCOLS),
    redisSecurityNamespace: parseOptionalRedisSecurityNamespace(
      read("PUBLISHING_REDIS_NAMESPACE"),
    ),
    outboxPollMilliseconds:
      parseOptionalEnvironmentInteger(
        read("PUBLISHING_OUTBOX_POLL_MS"),
        "PUBLISHING_OUTBOX_POLL_MS",
        250,
        60_000,
      ) ?? 1_000,
    outboxLeaseMilliseconds:
      parseOptionalEnvironmentInteger(
        read("PUBLISHING_OUTBOX_LEASE_MS"),
        "PUBLISHING_OUTBOX_LEASE_MS",
        5_000,
        900_000,
      ) ?? 120_000,
    outboxLeaseLimit:
      parseOptionalEnvironmentInteger(
        read("PUBLISHING_OUTBOX_LEASE_LIMIT"),
        "PUBLISHING_OUTBOX_LEASE_LIMIT",
        1,
        100,
      ) ?? 20,
    outboxConcurrency:
      parseOptionalEnvironmentInteger(
        read("PUBLISHING_OUTBOX_CONCURRENCY"),
        "PUBLISHING_OUTBOX_CONCURRENCY",
        1,
        100,
      ) ?? 4,
    outboxMaximumDeliveryAttempts:
      parseOptionalEnvironmentInteger(
        read("PUBLISHING_OUTBOX_MAX_DELIVERY_ATTEMPTS"),
        "PUBLISHING_OUTBOX_MAX_DELIVERY_ATTEMPTS",
        1,
        100,
      ) ?? 20,
    clipStitchrPublicOrigin: parseEnvironmentOrigin(
      read("CLIPSTITCHR_PUBLIC_ORIGIN"),
      "CLIPSTITCHR_PUBLIC_ORIGIN",
    ),
    enabledProviders,
    metaGraphVersion:
      enabledProviders.includes("instagram") ||
      enabledProviders.includes("instagram-standalone")
        ? parseMetaGraphVersion(read("META_GRAPH_API_VERSION"))
        : undefined,
    facebookAppId: enabledProviders.includes("instagram")
      ? parseEnvironmentIdentifier(read("FACEBOOK_APP_ID"), "FACEBOOK_APP_ID")
      : undefined,
    facebookAppSecret: enabledProviders.includes("instagram")
      ? parseEnvironmentSecret(read("FACEBOOK_APP_SECRET"), "FACEBOOK_APP_SECRET")
      : undefined,
    instagramAppId: enabledProviders.includes("instagram-standalone")
      ? parseEnvironmentIdentifier(read("INSTAGRAM_APP_ID"), "INSTAGRAM_APP_ID")
      : undefined,
    instagramAppSecret: enabledProviders.includes("instagram-standalone")
      ? parseEnvironmentSecret(
          read("INSTAGRAM_APP_SECRET"),
          "INSTAGRAM_APP_SECRET",
        )
      : undefined,
    tikTokClientId: enabledProviders.includes("tiktok")
      ? parseEnvironmentIdentifier(read("TIKTOK_CLIENT_ID"), "TIKTOK_CLIENT_ID")
      : undefined,
    tikTokClientSecret: enabledProviders.includes("tiktok")
      ? parseEnvironmentSecret(
          read("TIKTOK_CLIENT_SECRET"),
          "TIKTOK_CLIENT_SECRET",
        )
      : undefined,
    tikTokVerifiedMediaOrigin: enabledProviders.includes("tiktok")
      ? parseEnvironmentOrigin(
          read("TIKTOK_VERIFIED_MEDIA_ORIGIN"),
          "TIKTOK_VERIFIED_MEDIA_ORIGIN",
        )
      : undefined,
    r2AccountId: parseEnvironmentIdentifier(
      read("R2_ACCOUNT_ID"),
      "R2_ACCOUNT_ID",
    ),
    r2BucketName: parseEnvironmentIdentifier(
      read("R2_BUCKET_NAME"),
      "R2_BUCKET_NAME",
    ),
    r2AccessKeyId: parseEnvironmentIdentifier(
      read("R2_ACCESS_KEY_ID"),
      "R2_ACCESS_KEY_ID",
    ),
    r2SecretAccessKey: parseEnvironmentSecret(
      read("R2_SECRET_ACCESS_KEY"),
      "R2_SECRET_ACCESS_KEY",
    ),
    publishingMediaPublicOrigin: parseEnvironmentOrigin(
      read("PUBLISHING_MEDIA_PUBLIC_ORIGIN"),
      "PUBLISHING_MEDIA_PUBLIC_ORIGIN",
    ),
    publishingMediaTokenSecret,
    publishingMediaQuotaSecret,
  });

  assertProductionEnvironmentComplete(environment);
  assertProductionProviderConfigurationComplete(environment);
  assertPublishingOutboxConfiguration(environment);
  return environment;
};
