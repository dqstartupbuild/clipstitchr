import { RedisServiceAssertionReplayProtector } from "../assertions/RedisServiceAssertionReplayProtector.js";
import type { PublishingServiceEnvironment } from "../config/PublishingServiceEnvironment.js";
import { createHttpPublishingDispatchAccessAuthorizer } from "../dispatch-access/createHttpPublishingDispatchAccessAuthorizer.js";
import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import { createPublishingDatabaseReadinessDependency } from "../health/createPublishingDatabaseReadinessDependency.js";
import { createPrismaPublishingIntegrationConnectionStore } from "../integrations/createPrismaPublishingIntegrationConnectionStore.js";
import { createPublishingIntegrationRoutes } from "../integrations/createPublishingIntegrationRoutes.js";
import type { StructuredLogger } from "../logging/StructuredLogger.js";
import { createPublishingR2Client } from "../media-gateway/createPublishingR2Client.js";
import { createPublishingWorkflowMediaGrantResolver } from "../media-gateway/createPublishingWorkflowMediaGrantResolver.js";
import { createR2PublishingMediaHeadObjectReader } from "../media-gateway/createR2PublishingMediaHeadObjectReader.js";
import { RedisOAuthAuthorizationStateStore } from "../oauth/RedisOAuthAuthorizationStateStore.js";
import { PublishingOutboxDispatcher } from "../outbox/PublishingOutboxDispatcher.js";
import { createPrismaPublishingOutboxStore } from "../persistence/createPrismaPublishingOutboxStore.js";
import { createPublishingProviderRuntimes } from "../provider-runtime/registry/createPublishingProviderRuntimes.js";
import { createTikTokPullMediaVerifier } from "../provider-runtime/tiktok/createTikTokPullMediaVerifier.js";
import { RedisTikTokWebhookReplayProtector } from "../provider-runtime/tiktok/RedisTikTokWebhookReplayProtector.js";
import { createPrismaPublishingApiStore } from "../publishing-api/createPrismaPublishingApiStore.js";
import { createPublishingApiRoutes } from "../publishing-api/createPublishingApiRoutes.js";
import { RedisPublishingRateLimiter } from "../rate-limits/RedisPublishingRateLimiter.js";
import { defaultPublishingRateLimitPolicies } from "../rate-limits/defaultPublishingRateLimitPolicies.js";
import { createIoredisPublishingRedisRuntime } from "../redis/createIoredisPublishingRedisRuntime.js";
import { createPublishingRedisReadinessDependency } from "../redis/createPublishingRedisReadinessDependency.js";
import { closePublishingHttpServer } from "../server/closePublishingHttpServer.js";
import { createPublishingHttpServer } from "../server/createPublishingHttpServer.js";
import { createPublishingServiceRequestHandler } from "../server/createPublishingServiceRequestHandler.js";
import { listenPublishingHttpServer } from "../server/listenPublishingHttpServer.js";
import { waitForPublishingShutdownTask } from "../server/waitForPublishingShutdownTask.js";
import { createProviderTokenKeyring } from "../tokens/createProviderTokenKeyring.js";
import { createTikTokWebhookHttpHandler } from "../webhooks/createTikTokWebhookHttpHandler.js";
import { nudgePrismaTikTokWebhookOutbox } from "../webhooks/nudgePrismaTikTokWebhookOutbox.js";
import { resolvePrismaTikTokWebhookAttempt } from "../webhooks/resolvePrismaTikTokWebhookAttempt.js";
import type { TikTokWebhookHttpHandler } from "../webhooks/TikTokWebhookHttpHandler.js";
import { createPrismaPublishingWorkflowPort } from "../workflow-prisma/createPrismaPublishingWorkflowPort.js";
import { createPublishingWorkflowHandler } from "../workflow/createPublishingWorkflowHandler.js";
import { createEnabledPublishingProviderRuntimeRegistry } from "./createEnabledPublishingProviderRuntimeRegistry.js";
import { createPublishingLeaseOwner } from "./createPublishingLeaseOwner.js";
import { createPublishingPrismaClient } from "./createPublishingPrismaClient.js";
import { createPublishingServiceRuntimeStop } from "./createPublishingServiceRuntimeStop.js";
import { PublishingRuntimeCleanupStack } from "./PublishingRuntimeCleanupStack.js";
import type { PublishingServiceRuntime } from "./PublishingServiceRuntime.js";
import { readPublishingServiceRuntimeConfiguration } from "./readPublishingServiceRuntimeConfiguration.js";
import { runPublishingOutboxLoopWhenEnabled } from "./runPublishingOutboxLoopWhenEnabled.js";

export const startPublishingServiceRuntime = async (
  environment: PublishingServiceEnvironment,
  logger: StructuredLogger,
): Promise<PublishingServiceRuntime> => {
  const configuration = readPublishingServiceRuntimeConfiguration(environment);
  const cleanup = new PublishingRuntimeCleanupStack();
  const database = createPublishingPrismaClient(configuration.databaseUrl);
  cleanup.add(() => database.$disconnect());

  try {
    await database.$connect();

    const redis = createIoredisPublishingRedisRuntime(configuration.redisUrl);
    cleanup.add(() => redis.close());
    await redis.connect();

    const r2Client = createPublishingR2Client({
      accessKeyId: configuration.r2AccessKeyId,
      accountId: configuration.r2AccountId,
      secretAccessKey: configuration.r2SecretAccessKey,
    });
    cleanup.add(() => r2Client.destroy());

    const keyring = createProviderTokenKeyring([
      configuration.providerTokenCipherKey,
    ]);
    const rateLimiter = new RedisPublishingRateLimiter(
      redis.commands,
      defaultPublishingRateLimitPolicies,
      configuration.redisSecurityNamespace,
    );
    const oauthStateStore = new RedisOAuthAuthorizationStateStore(
      redis.commands,
      configuration.redisSecurityNamespace,
    );
    const replayProtector = new RedisServiceAssertionReplayProtector(
      redis.commands,
      configuration.redisSecurityNamespace,
    );
    const providerRuntimes = createEnabledPublishingProviderRuntimeRegistry(
      configuration.enabledProviders,
      createPublishingProviderRuntimes(
        configuration,
        createTikTokPullMediaVerifier(
          configuration.publishingMediaPublicOrigin,
        ),
      ),
    );
    const connectionStore = createPrismaPublishingIntegrationConnectionStore({
      cipherKey: configuration.providerTokenCipherKey,
      database,
      keyring,
    });
    const integrationRoutes = createPublishingIntegrationRoutes({
      connectionStore,
      oauthStateStore,
      publicOrigin: configuration.clipStitchrPublicOrigin,
      runtimes: providerRuntimes,
    });
    const apiRoutes = createPublishingApiRoutes({
      providerRuntimes,
      store: createPrismaPublishingApiStore({ database, keyring }),
    });
    const mediaGrantResolver = createPublishingWorkflowMediaGrantResolver({
      headObject: createR2PublishingMediaHeadObjectReader(
        r2Client,
        configuration.r2BucketName,
      ),
      publicOrigin: configuration.publishingMediaPublicOrigin,
      quotaSecret: configuration.publishingMediaQuotaSecret,
      tokenSecret: configuration.publishingMediaTokenSecret,
    });
    const workflowPort = createPrismaPublishingWorkflowPort({
      cipherKey: configuration.providerTokenCipherKey,
      database,
      keyring,
      providerRuntimes,
      resolveMediaGrants: mediaGrantResolver,
    });
    const leaseOwner = createPublishingLeaseOwner();
    const dispatcher = new PublishingOutboxDispatcher({
      concurrency: configuration.outboxConcurrency,
      handler: createPublishingWorkflowHandler({
        authorizeDispatch: createHttpPublishingDispatchAccessAuthorizer({
          appOrigin: configuration.clipStitchrPublicOrigin,
          secret: configuration.dispatchAccessSecret,
        }),
        port: workflowPort,
        providerRuntimes,
      }),
      leaseDurationMilliseconds: configuration.outboxLeaseMilliseconds,
      leaseLimit: configuration.outboxLeaseLimit,
      leaseOwner,
      logger,
      maximumDeliveryAttempts: configuration.outboxMaximumDeliveryAttempts,
      store: createPrismaPublishingOutboxStore(database),
    });
    const tikTokEnabled = configuration.enabledProviders.includes("tiktok");
    const tikTokClientId = configuration.tikTokClientId;
    const tikTokClientSecret = configuration.tikTokClientSecret;

    let tikTokWebhookHandler: TikTokWebhookHttpHandler | undefined;

    if (tikTokEnabled) {
      if (tikTokClientId === undefined || tikTokClientSecret === undefined) {
        throw new PublishingServiceConfigurationError(
          tikTokClientId === undefined
            ? "STUDIO_PUBLISHING_TIKTOK_CLIENT_ID"
            : "STUDIO_PUBLISHING_TIKTOK_CLIENT_SECRET",
        );
      }

      tikTokWebhookHandler = createTikTokWebhookHttpHandler({
          attemptResolver: (publishId) =>
            resolvePrismaTikTokWebhookAttempt(database, publishId),
          clientKey: tikTokClientId,
          clientSecret: tikTokClientSecret,
          outboxNudger: (attempt, nudgedAt) =>
            nudgePrismaTikTokWebhookOutbox(database, attempt, nudgedAt),
          rateLimiter,
          replayProtector: new RedisTikTokWebhookReplayProtector(
            redis.commands,
            configuration.redisSecurityNamespace,
          ),
        });
    }
    const requestHandler = createPublishingServiceRequestHandler({
      authentication: {
        audience: configuration.serviceAudience,
        issuer: configuration.serviceIssuer,
        replayProtector,
        signingKey: configuration.serviceAssertionSigningKey,
      },
      rateLimiter,
      readinessDependencies: Object.freeze([
        createPublishingDatabaseReadinessDependency(database),
        createPublishingRedisReadinessDependency(redis),
      ]),
      routes: Object.freeze([...integrationRoutes, ...apiRoutes]),
      studioBetaEnabled: configuration.studioBetaEnabled,
      ...(tikTokWebhookHandler === undefined ? {} : { tikTokWebhookHandler }),
    });
    const server = createPublishingHttpServer(requestHandler);
    cleanup.add(() => closePublishingHttpServer(server));
    await listenPublishingHttpServer(
      server,
      configuration.host,
      configuration.port,
    );

    const abortController = new AbortController();
    const outboxLoop = runPublishingOutboxLoopWhenEnabled(
      configuration.studioBetaEnabled,
      dispatcher,
      configuration.outboxPollMilliseconds,
      abortController.signal,
    );
    cleanup.add(async () => {
      abortController.abort();
      await waitForPublishingShutdownTask(outboxLoop);
    });
    const stop = createPublishingServiceRuntimeStop({
      abortController,
      database,
      outboxLoop,
      r2Client,
      redis,
      server,
    });

    cleanup.dismiss();
    return Object.freeze({ leaseOwner, outboxLoop, stop });
  } catch (error) {
    await cleanup.run();
    throw error;
  }
};
