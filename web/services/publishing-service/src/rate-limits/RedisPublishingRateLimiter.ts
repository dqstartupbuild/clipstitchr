import { PublishingRateLimitConfigurationError } from "../errors/PublishingRateLimitConfigurationError.js";
import { PublishingRateLimitStorageError } from "../errors/PublishingRateLimitStorageError.js";
import type { RedisScriptCommands } from "../redis/RedisScriptCommands.js";
import type { PublishingRateLimitDecision } from "./PublishingRateLimitDecision.js";
import type { PublishingRateLimitPolicies } from "./PublishingRateLimitPolicies.js";
import type { PublishingRateLimitRequest } from "./PublishingRateLimitRequest.js";
import type { PublishingRateLimiter } from "./PublishingRateLimiter.js";
import { assertPublishingRateLimitPolicies } from "./assertPublishingRateLimitPolicies.js";
import { createPublishingRateLimitKeys } from "./createPublishingRateLimitKeys.js";
import { freezePublishingRateLimitPolicies } from "./freezePublishingRateLimitPolicies.js";
import { isPublishingRateLimitAction } from "./isPublishingRateLimitAction.js";
import { parseRedisRateLimitResult } from "./parseRedisRateLimitResult.js";
import { redisDualScopeFixedWindowScript } from "./redisDualScopeFixedWindowScript.js";
import type { RedisSecurityNamespace } from "../redis/RedisSecurityNamespace.js";
import { createRedisSecurityNamespace } from "../redis/createRedisSecurityNamespace.js";

const TENANT_KEY_PATTERN =
  /^clerk-(?:personal:user_[A-Za-z0-9_-]{2,255}|organization:org_[A-Za-z0-9_-]{2,255})$/;
const MAX_REQUEST_COST = 1_000;

export class RedisPublishingRateLimiter implements PublishingRateLimiter {
  readonly #commands: RedisScriptCommands;
  readonly #policies: PublishingRateLimitPolicies;
  readonly #namespace: RedisSecurityNamespace;

  constructor(
    commands: RedisScriptCommands,
    policies: PublishingRateLimitPolicies,
    namespace: RedisSecurityNamespace,
  ) {
    assertPublishingRateLimitPolicies(policies);
    this.#commands = commands;
    this.#policies = freezePublishingRateLimitPolicies(policies);
    this.#namespace = createRedisSecurityNamespace(namespace);
  }

  async consume(
    request: PublishingRateLimitRequest,
  ): Promise<PublishingRateLimitDecision> {
    const cost = request.cost ?? 1;

    if (
      !isPublishingRateLimitAction(request.action) ||
      !TENANT_KEY_PATTERN.test(request.tenantKey) ||
      !Number.isSafeInteger(cost) ||
      cost < 1 ||
      cost > MAX_REQUEST_COST
    ) {
      throw new PublishingRateLimitConfigurationError();
    }

    const policy = this.#policies[request.action];

    if (cost > policy.global.limit || cost > policy.tenant.limit) {
      throw new PublishingRateLimitConfigurationError();
    }

    let rawResult: unknown;

    try {
      rawResult = await this.#commands.eval(redisDualScopeFixedWindowScript, {
        keys: createPublishingRateLimitKeys(
          this.#namespace,
          request.action,
          request.tenantKey,
        ),
        arguments: [
          String(policy.global.limit),
          String(policy.global.windowMilliseconds),
          String(policy.tenant.limit),
          String(policy.tenant.windowMilliseconds),
          String(cost),
        ],
      });
    } catch {
      throw new PublishingRateLimitStorageError();
    }

    const [
      allowedValue,
      observedAtEpochMilliseconds,
      globalRemaining,
      globalResetAtEpochMilliseconds,
      tenantRemaining,
      tenantResetAtEpochMilliseconds,
    ] = parseRedisRateLimitResult(rawResult);

    if (
      globalRemaining > policy.global.limit ||
      tenantRemaining > policy.tenant.limit ||
      globalResetAtEpochMilliseconds <= observedAtEpochMilliseconds ||
      tenantResetAtEpochMilliseconds <= observedAtEpochMilliseconds
    ) {
      throw new PublishingRateLimitStorageError();
    }

    const allowed = allowedValue === 1;
    const blockedResetTimes = allowed
      ? []
      : [
          ...(globalRemaining < cost ? [globalResetAtEpochMilliseconds] : []),
          ...(tenantRemaining < cost ? [tenantResetAtEpochMilliseconds] : []),
        ];

    if (!allowed && blockedResetTimes.length === 0) {
      throw new PublishingRateLimitStorageError();
    }

    const retryAfterSeconds = allowed
      ? 0
      : Math.max(
          1,
          Math.ceil(
            (Math.max(...blockedResetTimes) - observedAtEpochMilliseconds) / 1_000,
          ),
        );

    return Object.freeze({
      action: request.action,
      allowed,
      observedAtEpochMilliseconds,
      retryAfterSeconds,
      global: Object.freeze({
        remaining: globalRemaining,
        resetAtEpochMilliseconds: globalResetAtEpochMilliseconds,
      }),
      tenant: Object.freeze({
        remaining: tenantRemaining,
        resetAtEpochMilliseconds: tenantResetAtEpochMilliseconds,
      }),
    });
  }
}
