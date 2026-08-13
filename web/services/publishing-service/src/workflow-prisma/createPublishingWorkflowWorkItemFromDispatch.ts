import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { LeasedPublishingOutboxRecord } from "../persistence/LeasedPublishingOutboxRecord.js";
import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import { assertClerkUserId } from "../identity/assertClerkUserId.js";
import { isPublishingProvider } from "../providers/isPublishingProvider.js";
import type { PublishingWorkflowWorkItem } from "../workflow/PublishingWorkflowWorkItem.js";
import type { PrismaPublishingDispatchRecord } from "./PrismaPublishingDispatchRecord.js";
import { isPrismaPublishingStateTerminal } from "./isPrismaPublishingStateTerminal.js";
import { parsePublishingWorkflowGrantedScopes } from "./parsePublishingWorkflowGrantedScopes.js";
import { parsePublishingWorkflowMediaManifest } from "./parsePublishingWorkflowMediaManifest.js";
import { parsePublishingWorkflowSettings } from "./parsePublishingWorkflowSettings.js";
import { parsePublishingWorkflowTenantKey } from "./parsePublishingWorkflowTenantKey.js";
import { readPublishingWorkflowOutboxProductId } from "./readPublishingWorkflowOutboxProductId.js";

export const createPublishingWorkflowWorkItemFromDispatch = (
  lease: LeasedPublishingOutboxRecord,
  destination: PrismaPublishingDispatchRecord,
): PublishingWorkflowWorkItem => {
  const state = destination.postState;
  const integration = state.integration;
  const productId = readPublishingWorkflowOutboxProductId(lease);

  if (
    destination.id !== lease.id ||
    destination.tenantId !== lease.tenantId ||
    destination.postStateId !== lease.postStateId ||
    destination.workflowId !== lease.workflowId ||
    destination.leaseOwner !== lease.leaseOwner ||
    state.id !== lease.postStateId ||
    state.tenantId !== lease.tenantId ||
    state.post.integrationId !== integration.id ||
    state.integrationId !== integration.id ||
    state.post.organizationId !== integration.organizationId
    || state.productId !== productId
  ) {
    throw new PublishingResourceOwnershipError();
  }

  if (
    !isPublishingProvider(integration.providerIdentifier) ||
    integration.type !== integration.providerIdentifier
  ) {
    throw new ProviderRuntimeError("instagram", "invalid_request");
  }

  const provider = integration.providerIdentifier;
  const attempt = state.attempts[0];
  const source = state.mediaSource;

  if (
    state.attempts.length !== 1 ||
    attempt === undefined ||
    attempt.tenantId !== lease.tenantId ||
    attempt.postStateId !== state.id ||
    !Number.isSafeInteger(attempt.attemptNumber) ||
    attempt.attemptNumber < 1 ||
    !Number.isSafeInteger(attempt.checkpointVersion) ||
    attempt.checkpointVersion < 0 ||
    source === null ||
    state.mediaSourceId !== source.id ||
    source.tenantId !== lease.tenantId ||
    source.mediaId !== source.media.id ||
    source.media.organizationId !== integration.organizationId ||
    !Number.isSafeInteger(state.createdAt.getTime())
  ) {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  const media = parsePublishingWorkflowMediaManifest(
    provider,
    source.objectManifest,
  );
  const settings = parsePublishingWorkflowSettings(
    provider,
    state.post.settings,
  );
  assertClerkUserId(attempt.actorClerkUserId);
  const manifestByteLength = media.reduce(
    (total, object) => total + BigInt(object.byteLength),
    0n,
  );

  if (manifestByteLength !== source.byteLength) {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  const alreadyPublished =
    state.internalState === "PUBLISHED" ||
    state.post.state === "PUBLISHED" ||
    state.receipts.some((receipt) => receipt.resultClass === "PUBLISHED");
  const terminal = isPrismaPublishingStateTerminal({
    disposition: state.disposition,
    internalState: state.internalState,
    attemptStatus: attempt.status,
  });
  const providerCallAllowed =
    !alreadyPublished &&
    !terminal &&
    !integration.disabled &&
    (attempt.status === "INTENT" || attempt.status === "STARTED");

  return Object.freeze({
    tenantKey: parsePublishingWorkflowTenantKey(state.tenant.tenantKey),
    ownerId: attempt.actorClerkUserId,
    productId,
    postStateId: state.id,
    attemptId: attempt.id,
    attemptKey: attempt.id,
    checkpointVersion: attempt.checkpointVersion,
    checkpoint: attempt.checkpoint,
    providerCallAllowed,
    alreadyPublished,
    terminal,
    provider,
    integrationId: integration.id,
    accountId: integration.internalId,
    grantedScopes: parsePublishingWorkflowGrantedScopes(
      provider,
      integration.additionalSettings,
    ),
    caption: state.post.content,
    settings,
    media: settings.provider === "youtube" && settings.thumbnail !== undefined
      ? Object.freeze([...media, settings.thumbnail])
      : media,
    createdAtEpochMilliseconds: state.createdAt.getTime(),
  });
};
