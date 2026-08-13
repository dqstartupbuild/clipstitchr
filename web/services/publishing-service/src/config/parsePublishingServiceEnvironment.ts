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
import { parseStudioBetaEnabled } from "./parseStudioBetaEnabled.js";
import { parsePublishingDispatchAccessSecret } from "./parsePublishingDispatchAccessSecret.js";
import { assertPublishingSecureOrigins } from "./assertPublishingSecureOrigins.js";
import { assertPublishingSecureRedis } from "./assertPublishingSecureRedis.js";

const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);
const REDIS_PROTOCOLS = new Set(["redis:", "rediss:"]);

export const parsePublishingServiceEnvironment = (
  input: NodeJS.ProcessEnv,
): PublishingServiceEnvironment => {
  const mode = parsePublishingServiceRuntimeMode(
    readOptionalEnvironmentValue(input, "NODE_ENV"),
  );
  const enabledProviders = parsePublishingEnabledProviders(
    readOptionalEnvironmentValue(
      input,
      "STUDIO_PUBLISHING_ENABLED_PROVIDERS",
    ),
    mode,
  );
  const encodedServiceAssertionKey = readOptionalEnvironmentValue(input,
    "STUDIO_PUBLISHING_SERVICE_ASSERTION_KEY_BASE64",
  );
  const encodedProviderTokenKey = readOptionalEnvironmentValue(
    input,
    "STUDIO_PUBLISHING_TOKEN_KEY_BASE64",
  );
  const dispatchAccessSecret = parsePublishingDispatchAccessSecret(
    readOptionalEnvironmentValue(
      input,
      "STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET",
    ),
  );
  const publishingMediaTokenSecret = parsePublishingMediaSecret(
    readOptionalEnvironmentValue(
      input,
      "STUDIO_PUBLISHING_MEDIA_TOKEN_SECRET",
    ),
    "STUDIO_PUBLISHING_MEDIA_TOKEN_SECRET",
  );
  const publishingMediaQuotaSecret = parsePublishingMediaSecret(
    readOptionalEnvironmentValue(
      input,
      "STUDIO_PUBLISHING_MEDIA_QUOTA_SECRET",
    ),
    "STUDIO_PUBLISHING_MEDIA_QUOTA_SECRET",
  );

  if (
    encodedServiceAssertionKey !== undefined &&
    encodedServiceAssertionKey === encodedProviderTokenKey
  ) {
    throw new PublishingServiceConfigurationError("STUDIO_PUBLISHING_TOKEN_KEY_BASE64");
  }

  if (
    publishingMediaTokenSecret !== undefined &&
    publishingMediaTokenSecret === publishingMediaQuotaSecret
  ) {
    throw new PublishingServiceConfigurationError(
      "STUDIO_PUBLISHING_MEDIA_QUOTA_SECRET",
    );
  }

  if (
    dispatchAccessSecret !== undefined &&
    [
      encodedServiceAssertionKey,
      encodedProviderTokenKey,
      publishingMediaTokenSecret,
      publishingMediaQuotaSecret,
    ].includes(dispatchAccessSecret)
  ) {
    throw new PublishingServiceConfigurationError(
      "STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET",
    );
  }

  const serviceAssertionSigningKey = parseOptionalServiceAssertionSigningKey(
    encodedServiceAssertionKey,
  );
  const providerTokenCipherKey = parseOptionalProviderTokenCipherKey(
    readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_TOKEN_KEY_ID"),
    encodedProviderTokenKey,
  );

  const environment: PublishingServiceEnvironment = Object.freeze({
    studioBetaEnabled: parseStudioBetaEnabled(input["STUDIO_BETA_ENABLED"]),
    mode,
    host:
      parseEnvironmentIdentifier(
        readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_SERVICE_HOST"),
        "STUDIO_PUBLISHING_SERVICE_HOST",
      ) ?? (mode === "production" ? undefined : "127.0.0.1"),
    port:
      parseEnvironmentPort(
        readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_SERVICE_PORT") ??
          readOptionalEnvironmentValue(input, "PORT"),
        readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_SERVICE_PORT") === undefined
          ? "PORT"
          : "STUDIO_PUBLISHING_SERVICE_PORT",
      ) ?? (mode === "production" ? undefined : 3_202),
    serviceIssuer: parseEnvironmentIdentifier(
      readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_SERVICE_ISSUER"),
      "STUDIO_PUBLISHING_SERVICE_ISSUER",
    ),
    serviceAudience: parseEnvironmentIdentifier(
      readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_SERVICE_AUDIENCE"),
      "STUDIO_PUBLISHING_SERVICE_AUDIENCE",
    ),
    serviceAssertionSigningKey,
    dispatchAccessSecret,
    providerTokenCipherKey,
    databaseUrl: parseEnvironmentUrl(
      readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_DATABASE_URL"),
      "STUDIO_PUBLISHING_DATABASE_URL",
      POSTGRES_PROTOCOLS,
    ),
    redisUrl: parseEnvironmentUrl(readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_REDIS_URL"), "STUDIO_PUBLISHING_REDIS_URL", REDIS_PROTOCOLS),
    redisSecurityNamespace: parseOptionalRedisSecurityNamespace(
      readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_REDIS_NAMESPACE"),
    ),
    outboxPollMilliseconds:
      parseOptionalEnvironmentInteger(
        readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_OUTBOX_POLL_MS"),
        "STUDIO_PUBLISHING_OUTBOX_POLL_MS",
        250,
        60_000,
      ) ?? 1_000,
    outboxLeaseMilliseconds:
      parseOptionalEnvironmentInteger(
        readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_OUTBOX_LEASE_MS"),
        "STUDIO_PUBLISHING_OUTBOX_LEASE_MS",
        5_000,
        900_000,
      ) ?? 120_000,
    outboxLeaseLimit:
      parseOptionalEnvironmentInteger(
        readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_OUTBOX_LEASE_LIMIT"),
        "STUDIO_PUBLISHING_OUTBOX_LEASE_LIMIT",
        1,
        100,
      ) ?? 20,
    outboxConcurrency:
      parseOptionalEnvironmentInteger(
        readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_OUTBOX_CONCURRENCY"),
        "STUDIO_PUBLISHING_OUTBOX_CONCURRENCY",
        1,
        100,
      ) ?? 4,
    outboxMaximumDeliveryAttempts:
      parseOptionalEnvironmentInteger(
        readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_OUTBOX_MAX_DELIVERY_ATTEMPTS"),
        "STUDIO_PUBLISHING_OUTBOX_MAX_DELIVERY_ATTEMPTS",
        1,
        100,
      ) ?? 20,
    clipStitchrPublicOrigin: parseEnvironmentOrigin(
      readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_APP_ORIGIN"),
      "STUDIO_PUBLISHING_APP_ORIGIN",
    ),
    enabledProviders,
    metaGraphVersion:
      enabledProviders.includes("instagram") ||
      enabledProviders.includes("instagram-standalone")
        ? parseMetaGraphVersion(readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_META_GRAPH_API_VERSION"))
        : undefined,
    facebookAppId: enabledProviders.includes("instagram")
      ? parseEnvironmentIdentifier(readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_META_APP_ID"), "STUDIO_PUBLISHING_META_APP_ID")
      : undefined,
    facebookAppSecret: enabledProviders.includes("instagram")
      ? parseEnvironmentSecret(readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_META_APP_SECRET"), "STUDIO_PUBLISHING_META_APP_SECRET")
      : undefined,
    instagramAppId: enabledProviders.includes("instagram-standalone")
      ? parseEnvironmentIdentifier(readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_INSTAGRAM_APP_ID"), "STUDIO_PUBLISHING_INSTAGRAM_APP_ID")
      : undefined,
    instagramAppSecret: enabledProviders.includes("instagram-standalone")
      ? parseEnvironmentSecret(
          readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_INSTAGRAM_APP_SECRET"),
          "STUDIO_PUBLISHING_INSTAGRAM_APP_SECRET",
        )
      : undefined,
    tikTokClientId: enabledProviders.includes("tiktok")
      ? parseEnvironmentIdentifier(readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_TIKTOK_CLIENT_ID"), "STUDIO_PUBLISHING_TIKTOK_CLIENT_ID")
      : undefined,
    tikTokClientSecret: enabledProviders.includes("tiktok")
      ? parseEnvironmentSecret(
          readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_TIKTOK_CLIENT_SECRET"),
          "STUDIO_PUBLISHING_TIKTOK_CLIENT_SECRET",
        )
      : undefined,
    tikTokVerifiedMediaOrigin: enabledProviders.includes("tiktok")
      ? parseEnvironmentOrigin(
          readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN"),
          "STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN",
        )
      : undefined,
    googleClientId: enabledProviders.includes("youtube")
      ? parseEnvironmentIdentifier(
          readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_GOOGLE_CLIENT_ID"),
          "STUDIO_PUBLISHING_GOOGLE_CLIENT_ID",
        )
      : undefined,
    googleClientSecret: enabledProviders.includes("youtube")
      ? parseEnvironmentSecret(
          readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_GOOGLE_CLIENT_SECRET"),
          "STUDIO_PUBLISHING_GOOGLE_CLIENT_SECRET",
        )
      : undefined,
    r2AccountId: parseEnvironmentIdentifier(
      readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_R2_ACCOUNT_ID"),
      "STUDIO_PUBLISHING_R2_ACCOUNT_ID",
    ),
    r2BucketName: parseEnvironmentIdentifier(
      readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_R2_BUCKET_NAME"),
      "STUDIO_PUBLISHING_R2_BUCKET_NAME",
    ),
    r2AccessKeyId: parseEnvironmentIdentifier(
      readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_R2_ACCESS_KEY_ID"),
      "STUDIO_PUBLISHING_R2_ACCESS_KEY_ID",
    ),
    r2SecretAccessKey: parseEnvironmentSecret(
      readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_R2_SECRET_ACCESS_KEY"),
      "STUDIO_PUBLISHING_R2_SECRET_ACCESS_KEY",
    ),
    publishingMediaPublicOrigin: parseEnvironmentOrigin(
      readOptionalEnvironmentValue(input, "STUDIO_PUBLISHING_MEDIA_PUBLIC_ORIGIN"),
      "STUDIO_PUBLISHING_MEDIA_PUBLIC_ORIGIN",
    ),
    publishingMediaTokenSecret,
    publishingMediaQuotaSecret,
  });

  assertProductionEnvironmentComplete(environment);
  assertPublishingSecureOrigins(environment);
  assertPublishingSecureRedis(environment);
  assertProductionProviderConfigurationComplete(environment);
  assertPublishingOutboxConfiguration(environment);
  return environment;
};
