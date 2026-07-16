import {
  APIError,
  RateLimitExceededError,
  ValidationError,
} from "loops";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { createLoopsClient } from "../../lib/clipstitchr/email/loops/createLoopsClient";
import { getLoopsAccountEmailReadiness } from "../../lib/clipstitchr/email/loops/getLoopsAccountEmailReadiness";
import { getLoopsAccountTransactionalId } from "../../lib/clipstitchr/email/loops/getLoopsAccountTransactionalId";
import { sendLoopsAccountTransactionalEmail } from "../../lib/clipstitchr/email/loops/sendLoopsAccountTransactionalEmail";
import { EmailProviderConfigurationError } from "../../lib/clipstitchr/email/operations/EmailProviderConfigurationError";
import { getEmailProviderRetryDecision } from "../../lib/clipstitchr/email/operations/getEmailProviderRetryDecision";
import { resolveSiteUrl } from "../../lib/resolveSiteUrl";
import type { AccountEmailProcessResult } from "../../lib/clipstitchr/email/operations/AccountEmailProcessResult";
import { createLoopsAccountEmailDataVariables } from "../../lib/clipstitchr/email/loops/createLoopsAccountEmailDataVariables";

const accountEmailOperationLeaseMs = 4 * 60 * 1_000;

export const processAccountEmailOperation = internalAction({
  args: { operationId: v.id("accountEmailOperations") },
  handler: async (ctx, { operationId }): Promise<AccountEmailProcessResult> => {
    const readiness = getLoopsAccountEmailReadiness(process.env);

    if (!readiness.dispatchEnabled || !readiness.teamEnvironment) {
      await ctx.runMutation(
        internal.accountEmail.holdAccountEmailOperation
          .holdAccountEmailOperation,
        {
          failureCategory: "configuration",
          heldAt: Date.now(),
          operationId,
        },
      );
      return { processed: false as const, reason: "provider-disabled" as const };
    }

    const claimedAt = Date.now();
    const workerId = crypto.randomUUID();
    const operation = await ctx.runMutation(
      internal.accountEmail.claimAccountEmailOperation
        .claimAccountEmailOperation,
      {
        leaseExpiresAt: claimedAt + accountEmailOperationLeaseMs,
        now: claimedAt,
        operationId,
        workerId,
      },
    );

    if (!operation) {
      return { processed: false as const, reason: "not-claimable" as const };
    }

    const projection = await ctx.runQuery(
      internal.accountEmail.getAccountEmailDispatchProjection
        .getAccountEmailDispatchProjection,
      { now: Date.now(), operationId, workerId },
    );

    if (!projection) {
      await ctx.runMutation(
        internal.accountEmail.holdAccountEmailOperation
          .holdAccountEmailOperation,
        {
          failureCategory: "ineligible",
          heldAt: Date.now(),
          operationId,
        },
      );
      return { processed: false as const, reason: "recipient-unavailable" as const };
    }

    const capacity = await ctx.runMutation(
      internal.accountEmail.consumeAccountEmailProviderCapacity
        .consumeAccountEmailProviderCapacity,
      { ownerId: projection.operation.ownerId },
    );
    const providerCapacity = capacity.ok
      ? await ctx.runMutation(
          internal.email.consumeLoopsProviderRequestCapacity
            .consumeLoopsProviderRequestCapacity,
          {},
        )
      : capacity;

    if (!providerCapacity.ok) {
      const delayMs = Math.min(
        5 * 60 * 1_000,
        Math.max(1_000, Math.ceil(providerCapacity.retryAfter ?? 1_000)),
      );
      await ctx.runMutation(
        internal.accountEmail.deferAccountEmailOperation
          .deferAccountEmailOperation,
        { deferredAt: Date.now(), delayMs, operationId, workerId },
      );
      return { processed: false as const, reason: "provider-rate-limited" as const };
    }

    const attempt = await ctx.runMutation(
      internal.accountEmail.startAccountEmailProviderAttempt
        .startAccountEmailProviderAttempt,
      { operationId, startedAt: Date.now(), workerId },
    );

    if (!attempt.started) {
      return { processed: false as const, reason: "attempt-not-started" as const };
    }

    try {
      const siteUrl = resolveSiteUrl(process.env);
      await sendLoopsAccountTransactionalEmail({
        client: createLoopsClient(process.env.LOOPS_API_KEY ?? ""),
        dataVariables: createLoopsAccountEmailDataVariables({
          dashboardUrl: `${siteUrl}/dashboard`,
          eventVariables: projection.operation.dataVariables,
          firstName: projection.contact.firstName?.trim() || "there",
          settingsUrl: `${siteUrl}/dashboard/settings#plan-and-usage`,
          supportEmail: "support@followusai.com",
          templateKey: projection.operation.templateKey,
        }),
        developmentRecipientList: process.env.LOOPS_DEVELOPMENT_RECIPIENTS,
        idempotencyKey: `acct:${projection.operation.operationId}`,
        recipientEmail: projection.contact.normalizedEmail,
        teamEnvironment: readiness.teamEnvironment,
        transactionalId: getLoopsAccountTransactionalId(
          projection.operation.templateKey,
          process.env,
        ),
      });
      const acceptance: { recorded: boolean } = await ctx.runMutation(
        internal.accountEmail.recordAccountEmailOperationAccepted
          .recordAccountEmailOperationAccepted,
        { acceptedAt: Date.now(), operationId, workerId },
      );

      return acceptance.recorded
        ? { processed: true as const }
        : { processed: false as const, reason: "acceptance-raced" as const };
    } catch (error) {
      const failedAt = Date.now();

      if (error instanceof EmailProviderConfigurationError) {
        await ctx.runMutation(
          internal.accountEmail.recordAccountEmailOperationFailure
            .recordAccountEmailOperationFailure,
          {
            acceptanceUnknown: false,
            failedAt,
            failureCategory: "configuration",
            operationId,
            retryable: false,
            workerId,
          },
        );
        return { processed: false as const, reason: "configuration" as const };
      }

      const acceptanceUnknown =
        !(error instanceof ValidationError) &&
        !(error instanceof RateLimitExceededError) &&
        !(
          error instanceof APIError &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        );
      const decision = getEmailProviderRetryDecision(error, {
        acceptanceUnknown,
        attemptCount: attempt.attemptCount,
        idempotencyExpiresAt: attempt.idempotencyExpiresAt,
        now: failedAt,
        operationKind: "transactional",
      });

      if (decision.outcome === "accepted") {
        await ctx.runMutation(
          internal.accountEmail.recordAccountEmailOperationAccepted
            .recordAccountEmailOperationAccepted,
          { acceptedAt: failedAt, operationId, workerId },
        );
        return { processed: true as const };
      }

      const failureCategory =
        decision.reason === "provider-rate-limit"
          ? "rateLimited"
          : decision.reason === "provider-unavailable"
            ? "providerUnavailable"
            : decision.reason === "network"
              ? "network"
              : decision.reason === "ambiguous-outcome-expired"
                ? "ambiguous"
                : decision.reason === "attempt-limit"
                  ? "retryLimit"
                  : "invalidRequest";
      await ctx.runMutation(
        internal.accountEmail.recordAccountEmailOperationFailure
          .recordAccountEmailOperationFailure,
        {
          acceptanceUnknown,
          failedAt,
          failureCategory,
          operationId,
          retryable: decision.outcome === "retry",
          workerId,
        },
      );
      return { processed: false as const, reason: failureCategory };
    }
  },
});
