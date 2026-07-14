import {
  APIError,
  RateLimitExceededError,
  ValidationError,
} from "loops";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { createLoopsClient } from "../../lib/clipstitchr/email/loops/createLoopsClient";
import { getLoopsPrivacyDeletionConfiguration } from "../../lib/clipstitchr/email/loops/getLoopsPrivacyDeletionConfiguration";
import { getLoopsReadiness } from "../../lib/clipstitchr/email/loops/getLoopsReadiness";
import { EmailProviderConfigurationError } from "../../lib/clipstitchr/email/operations/EmailProviderConfigurationError";
import type { EmailProviderDispatchProjection } from "../../lib/clipstitchr/email/operations/EmailProviderDispatchProjection";
import { dispatchEmailProviderOperation } from "../../lib/clipstitchr/email/operations/dispatchEmailProviderOperation";
import { getEmailProviderRetryDecision } from "../../lib/clipstitchr/email/operations/getEmailProviderRetryDecision";
import type { EmailProviderProcessResult } from "../../lib/clipstitchr/email/operations/EmailProviderProcessResult";
import { resolveSiteUrl } from "../../lib/resolveSiteUrl";

const operationLeaseMs = 4 * 60 * 1_000;

export const processEmailProviderOperation = internalAction({
  args: {
    operationId: v.id("emailProviderOperations"),
  },
  handler: async (ctx, { operationId }): Promise<EmailProviderProcessResult> => {
    const readiness = getLoopsReadiness(process.env);
    const operationKind = await ctx.runQuery(
      internal.email.getEmailProviderOperationKind.getEmailProviderOperationKind,
      { operationId },
    );
    const privacyDeletionConfiguration =
      operationKind === "contactDelete"
        ? getLoopsPrivacyDeletionConfiguration(process.env)
        : null;
    const providerIsReady =
      operationKind === "contactDelete"
        ? privacyDeletionConfiguration !== null
        : readiness.dispatchEnabled && readiness.teamEnvironment !== null;

    if (!operationKind) {
      return { processed: false as const, reason: "not-claimable" as const };
    }

    if (!providerIsReady) {
      await ctx.runMutation(
        internal.email.holdEmailProviderOperation.holdEmailProviderOperation,
        { heldAt: Date.now(), operationId },
      );
      return { processed: false as const, reason: "provider-disabled" as const };
    }

    const claimedAt = Date.now();
    const workerId = crypto.randomUUID();
    const operation = await ctx.runMutation(
      internal.email.claimEmailProviderOperation.claimEmailProviderOperation,
      {
        leaseExpiresAt: claimedAt + operationLeaseMs,
        now: claimedAt,
        operationId,
        workerId,
      },
    );

    if (!operation) {
      return { processed: false as const, reason: "not-claimable" as const };
    }

    const kind = operation.kind;
    const providerTeamEnvironment =
      kind === "contactDelete"
        ? privacyDeletionConfiguration?.teamEnvironment
        : readiness.teamEnvironment;
    const providerApiKey =
      kind === "contactDelete"
        ? (privacyDeletionConfiguration?.apiKey ?? "")
        : (process.env.LOOPS_API_KEY ?? "");
    const configurationReady =
      kind === "contactDelete" || kind === "contactUnsubscribe"
        ? true
        : kind === "contactSync" || kind === "contactResubscribe"
          ? readiness.contactSyncReady
          : kind === "workflowEvent"
            ? readiness.workflowReady
            : readiness.confirmationReady;

    if (!configurationReady || !providerTeamEnvironment) {
      await ctx.runMutation(
        internal.email.recordEmailProviderOperationFailure
          .recordEmailProviderOperationFailure,
        {
          acceptanceUnknown: false,
          failedAt: Date.now(),
          failureCategory: "configuration",
          operationId,
          retryable: false,
          workerId,
        },
      );
      return { processed: false as const, reason: "not-ready" as const };
    }

    const providerReservation = await ctx.runMutation(
      internal.email.consumeLoopsProviderRequestCapacity
        .consumeLoopsProviderRequestCapacity,
      {},
    );

    if (!providerReservation.ok) {
      const delayMs = Math.min(
        5 * 60 * 1_000,
        Math.max(1_000, Math.ceil(providerReservation.retryAfter ?? 1_000)),
      );
      await ctx.runMutation(
        internal.email.deferEmailProviderOperation.deferEmailProviderOperation,
        {
          deferredAt: Date.now(),
          delayMs,
          operationId,
          workerId,
        },
      );
      return {
        processed: false as const,
        reason: "provider-rate-limited" as const,
      };
    }

    const attempt = await ctx.runMutation(
      internal.email.startEmailProviderAttempt.startEmailProviderAttempt,
      { operationId, startedAt: Date.now(), workerId },
    );

    if (!attempt.started) {
      return { processed: false as const, reason: "attempt-not-started" as const };
    }

    const projection = await ctx.runQuery(
      internal.email.getEmailProviderDispatchProjection
        .getEmailProviderDispatchProjection,
      { now: Date.now(), operationId, workerId },
    );

    if (!projection) {
      await ctx.runMutation(
        internal.email.recordEmailProviderOperationFailure
          .recordEmailProviderOperationFailure,
        {
          acceptanceUnknown: false,
          failedAt: Date.now(),
          failureCategory: "ineligible",
          operationId,
          retryable: false,
          workerId,
        },
      );
      return { processed: false as const, reason: "ineligible" as const };
    }

    try {
      await dispatchEmailProviderOperation({
        client: createLoopsClient(providerApiKey),
        confirmationSigningSecret:
          process.env.EMAIL_CONFIRMATION_TOKEN_SECRET,
        developmentRecipientList: process.env.LOOPS_DEVELOPMENT_RECIPIENTS,
        environment: process.env,
        projection: projection as EmailProviderDispatchProjection,
        siteUrl: resolveSiteUrl(process.env),
        teamEnvironment: providerTeamEnvironment,
      });
      const acceptance: {
        compensationQueued?: boolean;
        recorded: boolean;
      } = await ctx.runMutation(
        internal.email.recordEmailProviderOperationAccepted
          .recordEmailProviderOperationAccepted,
        { acceptedAt: Date.now(), operationId, workerId },
      );

      if (!acceptance.recorded) {
        return {
          processed: false as const,
          reason: acceptance.compensationQueued
            ? ("compensation-queued" as const)
            : ("acceptance-raced" as const),
        };
      }

      return { processed: true as const };
    } catch (error) {
      if (error instanceof EmailProviderConfigurationError) {
        await ctx.runMutation(
          internal.email.recordEmailProviderOperationFailure
            .recordEmailProviderOperationFailure,
          {
            acceptanceUnknown: false,
            failedAt: Date.now(),
            failureCategory: "configuration",
            operationId,
            retryable: false,
            workerId,
          },
        );
        return { processed: false as const, reason: "configuration" as const };
      }

      const failedAt = Date.now();
      const acceptanceUnknown =
        !(error instanceof ValidationError) &&
        !(error instanceof RateLimitExceededError) &&
        !(
          error instanceof APIError &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        );
      const decision = getEmailProviderRetryDecision(
        error,
        {
          acceptanceUnknown,
          attemptCount: attempt.attemptCount,
          idempotencyExpiresAt: attempt.idempotencyExpiresAt,
          now: failedAt,
          operationKind: projection.operation.kind,
        },
      );

      if (decision.outcome === "accepted") {
        const acceptance: {
          compensationQueued?: boolean;
          recorded: boolean;
        } = await ctx.runMutation(
          internal.email.recordEmailProviderOperationAccepted
            .recordEmailProviderOperationAccepted,
          { acceptedAt: failedAt, operationId, workerId },
        );
        return acceptance.recorded
          ? { processed: true as const }
          : {
              processed: false as const,
              reason: acceptance.compensationQueued
                ? ("compensation-queued" as const)
                : ("acceptance-raced" as const),
            };
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
        internal.email.recordEmailProviderOperationFailure
          .recordEmailProviderOperationFailure,
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
