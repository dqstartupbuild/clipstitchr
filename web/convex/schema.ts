import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { assetTagsValidator } from "./validators/assetTags";
import { automationProvenanceValidator } from "./validators/automationProvenance";
import { blogPostContentFormatValidator } from "./validators/blogPostContentFormat";
import { automationGenerationCountValidator } from "./validators/automationGenerationCount";
import { automationRunStatusValidator } from "./validators/automationRunStatus";
import { automationSelectionModeValidator } from "./validators/automationSelectionMode";
import { automationStitchrTemplateAllocationValidator } from "./validators/automationStitchrTemplateAllocation";
import { automationStitchrTextStyleChoiceValidator } from "./validators/automationStitchrTextStyleChoice";
import { automationTaskStatusValidator } from "./validators/automationTaskStatus";
import { automationTaskTypeValidator } from "./validators/automationTaskType";
import { automationToolValidator } from "./validators/automationTool";
import { automationCliprGenerationModeValidator } from "./validators/automationCliprGenerationMode";
import { avatarWardrobeStyleValidator } from "./validators/avatarWardrobeStyle";
import { cliprDurationSecondsValidator } from "./validators/cliprDurationSeconds";
import { cliprGenerationModeValidator } from "./validators/cliprGenerationMode";
import { cliprJobStageValidator } from "./validators/cliprJobStage";
import { cliprJobStatusValidator } from "./validators/cliprJobStatus";
import { cliprMetadataValidator } from "./validators/cliprMetadata";
import { cliprMusicMetadataValidator } from "./validators/cliprMusicMetadata";
import { cliDeviceAuthorizationStatusValidator } from "./validators/cliDeviceAuthorizationStatus";
import { clipPerformanceScoreValidator } from "./validators/clipPerformanceScore";
import { cliprResolvedGenerationModeValidator } from "./validators/cliprResolvedGenerationMode";
import { cliprScenePlanValidator } from "./validators/cliprScenePlan";
import { cliprVideoModelIdValidator } from "./validators/cliprVideoModelId";
import { clipTypeValidator } from "./validators/clipType";
import { hookLabCreativeBeatValidator } from "./validators/hookLabCreativeBeat";
import { hookLabIdeaScopeValidator } from "./validators/hookLabIdeaScope";
import { hookLabIdeaSourceTypeValidator } from "./validators/hookLabIdeaSourceType";
import { hookLabIdeaStatusValidator } from "./validators/hookLabIdeaStatus";
import { hookLabIdeaUseStatusValidator } from "./validators/hookLabIdeaUseStatus";
import { hookLabIdeaVariantStatusValidator } from "./validators/hookLabIdeaVariantStatus";
import { hookLabReviewStateValidator } from "./validators/hookLabReviewState";
import { hookLabStitchRecipeValidator } from "./validators/hookLabStitchRecipe";
import { hookLabTextBlueprintValidator } from "./validators/hookLabTextBlueprint";
import { hookLabTextDecisionValidator } from "./validators/hookLabTextDecision";
import { mediaJobStatusValidator } from "./validators/mediaJobStatus";
import { mediaJobTypeValidator } from "./validators/mediaJobType";
import { musicTrackSourceValidator } from "./validators/musicTrackSource";
import { notificationSourceTypeValidator } from "./validators/notificationSourceType";
import { providerJobStatusValidator } from "./validators/providerJobStatus";
import { providerJobTypeValidator } from "./validators/providerJobType";
import { quickEditMetadataValidator } from "./validators/quickEditMetadata";
import { quickEditSuggestionsValidator } from "./validators/quickEditSuggestions";
import { postBridgePostReferenceValidator } from "./validators/postBridgePostReference";
import { postBridgeSourceTypeValidator } from "./validators/postBridgeSourceType";
import { r2ObjectValidator } from "./validators/r2Object";
import { replicateJobPurposeValidator } from "./validators/replicateJobPurpose";
import { replicatePredictionStatusValidator } from "./validators/replicatePredictionStatus";
import { stitchScoreValidator } from "./validators/stitchScore";
import { stitchrHookFeedbackStatusValidator } from "./validators/stitchrHookFeedbackStatus";
import { stitchrHookPlanSourceValidator } from "./validators/stitchrHookPlanSource";
import { stitchrHookPlanStatusValidator } from "./validators/stitchrHookPlanStatus";
import { stitchrHookVariantValidator } from "./validators/stitchrHookVariant";
import { stitchrModeValidator } from "./validators/stitchrMode";
import { stitchSequenceSegmentValidator } from "./validators/stitchSequenceSegment";
import { swiprBackgroundSourceValidator } from "./validators/swiprBackgroundSource";
import { swiprProductSourceTypeValidator } from "./validators/swiprProductSourceType";
import { swiprSlideValidator } from "./validators/swiprSlide";
import { swiprCallToActionStyleValidator } from "./validators/swiprCallToActionStyle";
import { swaprMetadataValidator } from "./validators/swaprMetadata";
import { stitchMusicMetadataValidator } from "./validators/stitchMusicMetadata";
import {
  textOverlayValidator,
  textOverlaysValidator,
} from "./validators/textOverlay";
import { videoPlaybackRateValidator } from "./validators/videoPlaybackRate";
import { videoClipLibraryKindValidator } from "./validators/videoClipLibraryKind";
import { videoTrimRangeValidator } from "./validators/videoTrimRange";
import { waitlistSourceValidator } from "./validators/waitlistSource";
import { browserRecognitionRevocationReasonValidator } from "./validators/browserRecognitionRevocationReason";
import { emailDeliveryStatusValidator } from "./validators/emailDeliveryStatus";
import { emailProviderAcceptanceStatusValidator } from "./validators/emailProviderAcceptanceStatus";
import { emailProviderFailureCategoryValidator } from "./validators/emailProviderFailureCategory";
import { emailProviderOperationKindValidator } from "./validators/emailProviderOperationKind";
import { emailProviderOperationStatusValidator } from "./validators/emailProviderOperationStatus";
import { emailTransactionalTemplateKeyValidator } from "./validators/emailTransactionalTemplateKey";
import { loopsWebhookDispositionValidator } from "./validators/loopsWebhookDisposition";
import { loopsWebhookEventTypeValidator } from "./validators/loopsWebhookEventType";
import { marketingConsentStatusValidator } from "./validators/marketingConsentStatus";
import { marketingDeletionStatusValidator } from "./validators/marketingDeletionStatus";
import { marketingLeadSegmentValidator } from "./validators/marketingLeadSegment";
import { marketingLeadStageValidator } from "./validators/marketingLeadStage";
import { marketingMailingListMembershipStatusValidator } from "./validators/marketingMailingListMembershipStatus";
import { marketingSubscriptionStatusValidator } from "./validators/marketingSubscriptionStatus";
import { marketingSuppressionStatusValidator } from "./validators/marketingSuppressionStatus";
import { marketingVerificationStatusValidator } from "./validators/marketingVerificationStatus";
import { marketingWorkflowEnrollmentStatusValidator } from "./validators/marketingWorkflowEnrollmentStatus";
import { marketingWorkflowKeyValidator } from "./validators/marketingWorkflowKey";
import { marketingWorkflowVersionValidator } from "./validators/marketingWorkflowVersion";
import { publicToolGateModeValidator } from "./validators/publicToolGateMode";
import { publicToolGateVariantValidator } from "./validators/publicToolGateVariant";
import { toolLeadInteractionTypeValidator } from "./validators/toolLeadInteractionType";
import { toolLeadSourceValidator } from "./validators/toolLeadSource";
import { courseEntitlementStatusValidator } from "./validators/courseEntitlementStatus";
import { courseKeyValidator } from "./validators/courseKey";
import { courseVersionValidator } from "./validators/courseVersion";
import { creditGrantStatusValidator } from "./validators/creditGrantStatus";
import { creditGrantTypeValidator } from "./validators/creditGrantType";
import { entitlementStateValidator } from "./validators/entitlementState";
import { generationSlotStateValidator } from "./validators/generationSlotState";
import { planKeyValidator } from "./validators/planKey";
import { stripeWebhookEventStatusValidator } from "./validators/stripeWebhookEventStatus";
import { usageAllocationStateValidator } from "./validators/usageAllocationState";
import { usageLedgerEntryTypeValidator } from "./validators/usageLedgerEntryType";
import { usageLedgerOperationValidator } from "./validators/usageLedgerOperation";
import { usageLedgerSourceValidator } from "./validators/usageLedgerSource";
import { usageOperationValidator } from "./validators/usageOperation";
import { usageReservationStateValidator } from "./validators/usageReservationState";
import { usageResourceValidator } from "./validators/usageResource";
import { workerQueueSourceKindValidator } from "./validators/workerQueueSourceKind";
import { workerQueueStatusValidator } from "./validators/workerQueueStatus";
import { workerQueueWorkerValidator } from "./validators/workerQueueWorker";

export default defineSchema({
  billingEntitlements: defineTable({
    ownerId: v.string(),
    planKey: planKeyValidator,
    state: entitlementStateValidator,
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    pendingPlanKey: v.optional(planKeyValidator),
    pendingStripePriceId: v.optional(v.string()),
    currentPeriodStart: v.string(),
    currentPeriodEnd: v.string(),
    cancelAtPeriodEnd: v.boolean(),
    graceEndsAt: v.optional(v.string()),
    billingReviewRequired: v.boolean(),
    billingReviewReason: v.optional(v.string()),
    supportOverrideState: v.optional(entitlementStateValidator),
    supportOverrideActor: v.optional(v.string()),
    supportOverrideReason: v.optional(v.string()),
    supportOverrideExpiresAt: v.optional(v.string()),
    sourceEventId: v.string(),
    sourceEventCreatedAt: v.number(),
    latestSubscriptionEventCreatedAt: v.number(),
    latestPaymentEventCreatedAt: v.number(),
    latestPaidInvoiceId: v.optional(v.string()),
    lastPaymentAt: v.optional(v.string()),
    version: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"])
    .index("by_state_period_end", ["state", "currentPeriodEnd"]),
  billingEntitlementHistory: defineTable({
    ownerId: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    planKey: planKeyValidator,
    state: entitlementStateValidator,
    previousPlanKey: v.optional(planKeyValidator),
    previousState: v.optional(entitlementStateValidator),
    reason: v.string(),
    eventCreatedAt: v.number(),
    createdAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_event", ["eventId"]),
  dailyDraftLimitReconciliations: defineTable({
    ownerId: v.string(),
    eventId: v.string(),
    planKey: planKeyValidator,
    disabledProductIds: v.array(v.string()),
    reason: v.string(),
    createdAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_event", ["eventId"]),
  productLimitReconciliations: defineTable({
    ownerId: v.string(),
    eventId: v.string(),
    planKey: planKeyValidator,
    archivedProductIds: v.array(v.string()),
    reason: v.string(),
    createdAt: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_owner_created", ["ownerId", "createdAt"]),
  billingCheckoutSessions: defineTable({
    ownerId: v.string(),
    catalogKey: v.string(),
    stripeCheckoutSessionId: v.string(),
    mode: v.union(v.literal("subscription"), v.literal("payment")),
    status: v.union(
      v.literal("created"),
      v.literal("completed"),
      v.literal("expired"),
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_stripe_session", ["stripeCheckoutSessionId"]),
  stripeWebhookEvents: defineTable({
    eventId: v.string(),
    eventType: v.string(),
    objectId: v.optional(v.string()),
    livemode: v.boolean(),
    eventCreatedAt: v.number(),
    status: stripeWebhookEventStatusValidator,
    error: v.optional(v.string()),
    processedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_status_created", ["status", "createdAt"])
    .index("by_object_created", ["objectId", "eventCreatedAt"]),
  usagePeriods: defineTable({
    ownerId: v.string(),
    periodKey: v.string(),
    planKeySnapshot: planKeyValidator,
    stripeSubscriptionId: v.string(),
    stripeInvoiceId: v.string(),
    periodStart: v.string(),
    periodEnd: v.string(),
    creationCreditsGranted: v.number(),
    creationCreditsReserved: v.number(),
    creationCreditsConsumed: v.number(),
    creationCreditsAdjusted: v.number(),
    aiVideosGranted: v.number(),
    aiVideosReserved: v.number(),
    aiVideosConsumed: v.number(),
    aiVideosAdjusted: v.number(),
    grantEventId: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_period", ["ownerId", "periodKey"])
    .index("by_subscription_start", ["stripeSubscriptionId", "periodStart"])
    .index("by_stripe_invoice", ["stripeInvoiceId"])
    .index("by_period_end", ["periodEnd"]),
  creditGrants: defineTable({
    ownerId: v.string(),
    grantId: v.string(),
    grantType: creditGrantTypeValidator,
    periodKey: v.optional(v.string()),
    amountGranted: v.number(),
    amountReserved: v.number(),
    amountConsumed: v.number(),
    amountRevoked: v.number(),
    spendPriority: v.number(),
    availableFrom: v.string(),
    expiresAt: v.string(),
    requiresActiveSubscription: v.boolean(),
    status: creditGrantStatusValidator,
    stripeInvoiceId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    stripeChargeId: v.optional(v.string()),
    sourceEventId: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_status_priority_expiry", [
      "ownerId",
      "status",
      "spendPriority",
      "expiresAt",
    ])
    .index("by_grant", ["grantId"])
    .index("by_owner_period", ["ownerId", "periodKey"])
    .index("by_payment_intent", ["stripePaymentIntentId"])
    .index("by_source_event", ["sourceEventId"])
    .index("by_status_expiry", ["status", "expiresAt"]),
  usageReservations: defineTable({
    ownerId: v.string(),
    reservationId: v.string(),
    idempotencyKey: v.string(),
    resource: usageResourceValidator,
    operation: usageOperationValidator,
    amount: v.number(),
    state: usageReservationStateValidator,
    planKeySnapshot: planKeyValidator,
    periodKey: v.optional(v.string()),
    batchId: v.optional(v.string()),
    domainKind: v.string(),
    domainId: v.string(),
    providerJobId: v.optional(v.string()),
    mediaJobId: v.optional(v.string()),
    automationTaskId: v.optional(v.string()),
    generationSlotId: v.optional(v.string()),
    expiresAt: v.string(),
    committedAt: v.optional(v.string()),
    releasedAt: v.optional(v.string()),
    releaseReason: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_state", ["ownerId", "state"])
    .index("by_idempotency_key", ["idempotencyKey"])
    .index("by_resource_state_expiry", ["resource", "state", "expiresAt"])
    .index("by_domain", ["domainKind", "domainId"])
    .index("by_batch", ["batchId"])
    .index("by_reservation", ["reservationId"]),
  usageReservationAllocations: defineTable({
    ownerId: v.string(),
    reservationId: v.string(),
    grantId: v.string(),
    amount: v.number(),
    state: usageAllocationStateValidator,
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_reservation", ["reservationId"])
    .index("by_grant_state", ["grantId", "state"])
    .index("by_owner_reservation", ["ownerId", "reservationId"]),
  usageLedgerEntries: defineTable({
    ownerId: v.string(),
    ledgerEntryId: v.string(),
    idempotencyKey: v.string(),
    resource: usageResourceValidator,
    entryType: usageLedgerEntryTypeValidator,
    quantity: v.number(),
    availableDelta: v.number(),
    reservedDelta: v.number(),
    consumedDelta: v.number(),
    periodKey: v.optional(v.string()),
    grantId: v.optional(v.string()),
    reservationId: v.optional(v.string()),
    operation: usageLedgerOperationValidator,
    domainKind: v.string(),
    domainId: v.optional(v.string()),
    batchId: v.optional(v.string()),
    source: usageLedgerSourceValidator,
    stripeSourceId: v.optional(v.string()),
    supportActor: v.optional(v.string()),
    reason: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_idempotency_key", ["idempotencyKey"])
    .index("by_reservation", ["reservationId"])
    .index("by_grant", ["grantId"])
    .index("by_stripe_source", ["stripeSourceId"]),
  zeroCostUsageEvents: defineTable({
    ownerId: v.string(),
    eventId: v.string(),
    idempotencyKey: v.string(),
    operation: usageOperationValidator,
    planKeySnapshot: planKeyValidator,
    domainKind: v.string(),
    domainId: v.string(),
    batchId: v.optional(v.string()),
    source: usageLedgerSourceValidator,
    generationSlotId: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_idempotency_key", ["idempotencyKey"])
    .index("by_domain", ["domainKind", "domainId"]),
  generationSlots: defineTable({
    ownerId: v.string(),
    slotId: v.string(),
    domainJobId: v.string(),
    tool: v.string(),
    planKeySnapshot: planKeyValidator,
    state: generationSlotStateValidator,
    idempotencyKey: v.string(),
    acquiredAt: v.optional(v.string()),
    releasedAt: v.optional(v.string()),
    heartbeatAt: v.optional(v.string()),
    expiresAt: v.string(),
    releaseReason: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_state", ["ownerId", "state"])
    .index("by_slot", ["slotId"])
    .index("by_domain", ["domainJobId"])
    .index("by_idempotency_key", ["idempotencyKey"])
    .index("by_state_expiry", ["state", "expiresAt"]),
  workerQueueEntries: defineTable({
    queueEntryId: v.string(),
    worker: workerQueueWorkerValidator,
    sourceKind: workerQueueSourceKindValidator,
    sourceId: v.string(),
    ownerId: v.string(),
    tool: v.string(),
    planKeySnapshot: planKeyValidator,
    queueLane: planKeyValidator,
    status: workerQueueStatusValidator,
    generationRequired: v.boolean(),
    usageReservationId: v.optional(v.string()),
    usageReservationIds: v.optional(v.array(v.string())),
    generationSlotId: v.optional(v.string()),
    lockId: v.optional(v.string()),
    lockedBy: v.optional(v.string()),
    lockedUntil: v.optional(v.string()),
    attempt: v.number(),
    notBefore: v.optional(v.string()),
    queuedAt: v.string(),
    startedAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_worker_status_lane_created", [
      "worker",
      "status",
      "queueLane",
      "queuedAt",
    ])
    .index("by_worker_status_created", ["worker", "status", "queuedAt"])
    .index("by_owner_status", ["ownerId", "status"])
    .index("by_source", ["sourceKind", "sourceId"])
    .index("by_status_lock", ["status", "lockedUntil"])
    .index("by_queue_entry", ["queueEntryId"]),
  workerQueueSchedulingState: defineTable({
    worker: workerQueueWorkerValidator,
    starterDeficit: v.number(),
    proDeficit: v.number(),
    agencyDeficit: v.number(),
    lastLane: v.optional(planKeyValidator),
    updatedAt: v.string(),
  }).index("by_worker", ["worker"]),
  waitlist: defineTable({
    name: v.string(),
    email: v.string(),
    normalizedEmail: v.string(),
    source: waitlistSourceValidator,
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_normalized_email", ["normalizedEmail"])
    .index("by_created", ["createdAt"]),
  marketingContacts: defineTable({
    normalizedEmail: v.string(),
    contactName: v.string(),
    providerContactKey: v.string(),
    providerContactId: v.optional(v.string()),
    consentStatus: marketingConsentStatusValidator,
    verificationStatus: marketingVerificationStatusValidator,
    subscriptionStatus: marketingSubscriptionStatusValidator,
    suppressionStatus: marketingSuppressionStatusValidator,
    deletionStatus: marketingDeletionStatusValidator,
    marketingEligible: v.boolean(),
    firstTool: v.optional(toolLeadSourceValidator),
    latestTool: v.optional(toolLeadSourceValidator),
    leadSegment: marketingLeadSegmentValidator,
    leadStage: marketingLeadStageValidator,
    currentConsentId: v.optional(v.id("marketingConsents")),
    legacyWaitlistId: v.optional(v.id("waitlist")),
    subscriptionChangedAt: v.optional(v.number()),
    suppressionChangedAt: v.optional(v.number()),
    deletionChangedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_normalized_email", ["normalizedEmail"])
    .index("by_provider_contact_key", ["providerContactKey"])
    .index("by_provider_contact_id", ["providerContactId"])
    .index("by_legacy_waitlist_id", ["legacyWaitlistId"]),
  marketingConsents: defineTable({
    contactId: v.id("marketingContacts"),
    status: marketingConsentStatusValidator,
    copyVersion: v.optional(v.string()),
    source: waitlistSourceValidator,
    capturedAt: v.number(),
    confirmedAt: v.optional(v.number()),
    withdrawnAt: v.optional(v.number()),
    legacyWaitlistId: v.optional(v.id("waitlist")),
    createdAt: v.number(),
  })
    .index("by_contact_captured", ["contactId", "capturedAt"])
    .index("by_contact_status", ["contactId", "status"])
    .index("by_legacy_waitlist_id", ["legacyWaitlistId"]),
  marketingMailingListMemberships: defineTable({
    contactId: v.id("marketingContacts"),
    providerMailingListId: v.string(),
    status: marketingMailingListMembershipStatusValidator,
    eventAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_contact_list", ["contactId", "providerMailingListId"])
    .index("by_list_status", ["providerMailingListId", "status"]),
  toolLeadCaptures: defineTable({
    contactId: v.id("marketingContacts"),
    consentId: v.id("marketingConsents"),
    source: toolLeadSourceValidator,
    gateMode: publicToolGateModeValidator,
    gateVariant: publicToolGateVariantValidator,
    capturedAt: v.number(),
  })
    .index("by_contact_captured", ["contactId", "capturedAt"])
    .index("by_source_captured", ["source", "capturedAt"]),
  toolLeadInteractions: defineTable({
    contactId: v.id("marketingContacts"),
    recognitionTokenId: v.id("browserRecognitionTokens"),
    source: toolLeadSourceValidator,
    interactionType: toolLeadInteractionTypeValidator,
    gateMode: publicToolGateModeValidator,
    gateVariant: publicToolGateVariantValidator,
    occurredAt: v.number(),
  })
    .index("by_contact_occurred", ["contactId", "occurredAt"])
    .index("by_token_occurred", ["recognitionTokenId", "occurredAt"]),
  browserRecognitionTokens: defineTable({
    contactId: v.id("marketingContacts"),
    tokenHash: v.string(),
    issuedAt: v.number(),
    expiresAt: v.number(),
    revokedAt: v.optional(v.number()),
    revocationReason: v.optional(browserRecognitionRevocationReasonValidator),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_contact_issued", ["contactId", "issuedAt"]),
  courseEntitlements: defineTable({
    contactId: v.id("marketingContacts"),
    courseKey: courseKeyValidator,
    courseVersion: courseVersionValidator,
    status: courseEntitlementStatusValidator,
    requestedAt: v.number(),
    activatedAt: v.optional(v.number()),
    releaseStoppedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_contact_course_version", [
      "contactId",
      "courseKey",
      "courseVersion",
    ])
    .index("by_contact_status", ["contactId", "status"]),
  courseAccessSessions: defineTable({
    contactId: v.id("marketingContacts"),
    tokenHash: v.string(),
    issuedAt: v.number(),
    expiresAt: v.number(),
    lastUsedAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_contact_issued", ["contactId", "issuedAt"]),
  courseProgressItems: defineTable({
    entitlementId: v.id("courseEntitlements"),
    itemId: v.string(),
    completed: v.boolean(),
    note: v.string(),
    updatedAt: v.number(),
  })
    .index("by_entitlement_item", ["entitlementId", "itemId"])
    .index("by_entitlement_updated", ["entitlementId", "updatedAt"]),
  emailConfirmationTokens: defineTable({
    contactId: v.id("marketingContacts"),
    courseKey: v.optional(courseKeyValidator),
    tokenRecordId: v.string(),
    tokenDigest: v.string(),
    generation: v.number(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    supersededAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_token_record_id", ["tokenRecordId"])
    .index("by_contact_generation", ["contactId", "generation"]),
  emailProviderOperations: defineTable({
    contactId: v.id("marketingContacts"),
    kind: emailProviderOperationKindValidator,
    status: emailProviderOperationStatusValidator,
    acceptanceStatus: emailProviderAcceptanceStatusValidator,
    deliveryStatus: emailDeliveryStatusValidator,
    workflowKey: v.optional(marketingWorkflowKeyValidator),
    workflowVersion: v.optional(marketingWorkflowVersionValidator),
    toolSource: v.optional(toolLeadSourceValidator),
    gateMode: v.optional(publicToolGateModeValidator),
    leadSegment: v.optional(marketingLeadSegmentValidator),
    transactionalTemplateKey: v.optional(
      emailTransactionalTemplateKeyValidator,
    ),
    confirmationTokenId: v.optional(v.id("emailConfirmationTokens")),
    enrollmentId: v.optional(v.id("marketingWorkflowEnrollments")),
    compensatesOperationId: v.optional(v.id("emailProviderOperations")),
    dependsOnOperationId: v.optional(v.id("emailProviderOperations")),
    attemptCount: v.number(),
    nextAttemptAt: v.number(),
    leaseOwner: v.optional(v.string()),
    leaseExpiresAt: v.optional(v.number()),
    attemptLeaseOwner: v.optional(v.string()),
    idempotencyExpiresAt: v.number(),
    ambiguousAt: v.optional(v.number()),
    providerMessageId: v.optional(v.string()),
    failureCategory: v.optional(emailProviderFailureCategoryValidator),
    acceptedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    deliveryChangedAt: v.optional(v.number()),
    terminalAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status_next_attempt", ["status", "nextAttemptAt"])
    .index("by_status_lease_expiration", ["status", "leaseExpiresAt"])
    .index("by_contact_created", ["contactId", "createdAt"])
    .index("by_contact_kind_status", ["contactId", "kind", "status"])
    .index("by_compensated_operation", ["compensatesOperationId"])
    .index("by_dependency_status", ["dependsOnOperationId", "status"])
    .index("by_provider_message_id", ["providerMessageId"]),
  marketingWorkflowEnrollments: defineTable({
    contactId: v.id("marketingContacts"),
    workflowKey: marketingWorkflowKeyValidator,
    workflowVersion: marketingWorkflowVersionValidator,
    status: marketingWorkflowEnrollmentStatusValidator,
    operationId: v.optional(v.id("emailProviderOperations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_contact_workflow_version", [
      "contactId",
      "workflowKey",
      "workflowVersion",
    ])
    .index("by_contact_status", ["contactId", "status"]),
  loopsWebhookEvents: defineTable({
    webhookId: v.string(),
    eventType: loopsWebhookEventTypeValidator,
    schemaVersion: v.string(),
    eventAt: v.number(),
    disposition: loopsWebhookDispositionValidator,
    contactId: v.optional(v.id("marketingContacts")),
    operationId: v.optional(v.id("emailProviderOperations")),
    processedAt: v.number(),
  })
    .index("by_webhook_id", ["webhookId"])
    .index("by_event_at", ["eventAt"]),
  providerDeletionTombstones: defineTable({
    providerContactKey: v.string(),
    providerContactId: v.optional(v.string()),
    contactId: v.optional(v.id("marketingContacts")),
    webhookId: v.string(),
    eventAt: v.number(),
    deletedAt: v.number(),
    clearedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_provider_contact_key", ["providerContactKey"])
    .index("by_provider_contact_id", ["providerContactId"])
    .index("by_contact", ["contactId"]),
  blogPosts: defineTable({
    slug: v.string(),
    externalId: v.optional(v.string()),
    title: v.string(),
    metaDescription: v.string(),
    contentFormat: blogPostContentFormatValidator,
    content: v.string(),
    contentHtml: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
    publishedAt: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["publishedAt"]),
  blogPostCards: defineTable({
    slug: v.string(),
    title: v.string(),
    metaDescription: v.string(),
    imageUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
    readingTimeMinutes: v.number(),
    publishedAt: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["publishedAt"]),
  videoClips: defineTable({
    ownerId: v.string(),
    id: v.string(),
    usageReservationId: v.optional(v.string()),
    name: v.string(),
    tags: assetTagsValidator,
    videoDescription: v.optional(v.string()),
    mainPersonDescription: v.optional(v.string()),
    outfitDescription: v.optional(v.string()),
    locationDescription: v.optional(v.string()),
    poseDescription: v.optional(v.string()),
    performanceScore: v.optional(clipPerformanceScoreValidator),
    quickEdit: v.optional(quickEditMetadataValidator),
    productDescription: v.optional(v.string()),
    productId: v.optional(v.string()),
    originalName: v.string(),
    clipType: clipTypeValidator,
    libraryKind: v.optional(videoClipLibraryKindValidator),
    videoObject: r2ObjectValidator,
    posterObject: v.optional(r2ObjectValidator),
    posterVersion: v.optional(v.number()),
    mimeType: v.string(),
    sourceMimeType: v.string(),
    size: v.number(),
    originalSize: v.number(),
    width: v.number(),
    height: v.number(),
    aspectRatio: v.number(),
    duration: v.number(),
    defaultTrimRange: v.optional(videoTrimRangeValidator),
    hasAudio: v.boolean(),
    swaprMetadata: v.optional(swaprMetadataValidator),
    cliprMetadata: v.optional(cliprMetadataValidator),
    isPosted: v.optional(v.boolean()),
    postedAt: v.optional(v.string()),
    automation: v.optional(automationProvenanceValidator),
    hookLabIdeaId: v.optional(v.string()),
    hookLabIdeaUseId: v.optional(v.string()),
    hookLabIdeaVariantIndex: v.optional(v.number()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_product_created", ["ownerId", "productId", "createdAt"])
    .index("by_owner_is_posted_created", ["ownerId", "isPosted", "createdAt"])
    .index("by_owner_product_is_posted_created", [
      "ownerId",
      "productId",
      "isPosted",
      "createdAt",
    ])
    .index("by_owner_library_kind_created", [
      "ownerId",
      "libraryKind",
      "createdAt",
    ])
    .index("by_owner_product_library_kind_created", [
      "ownerId",
      "productId",
      "libraryKind",
      "createdAt",
    ])
    .index("by_owner_library_kind_is_posted_created", [
      "ownerId",
      "libraryKind",
      "isPosted",
      "createdAt",
    ])
    .index("by_owner_product_library_kind_is_posted_created", [
      "ownerId",
      "productId",
      "libraryKind",
      "isPosted",
      "createdAt",
    ])
    .index("by_owner_id", ["ownerId", "id"]),
  videoClipCards: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    tags: assetTagsValidator,
    searchText: v.string(),
    performanceScore: v.optional(clipPerformanceScoreValidator),
    quickEdit: v.optional(quickEditMetadataValidator),
    productId: v.optional(v.string()),
    originalName: v.string(),
    clipType: clipTypeValidator,
    libraryKind: v.optional(videoClipLibraryKindValidator),
    videoObject: r2ObjectValidator,
    posterObject: v.optional(r2ObjectValidator),
    posterVersion: v.optional(v.number()),
    mimeType: v.string(),
    sourceMimeType: v.string(),
    size: v.number(),
    originalSize: v.number(),
    width: v.number(),
    height: v.number(),
    aspectRatio: v.number(),
    duration: v.number(),
    defaultTrimRange: v.optional(videoTrimRangeValidator),
    hasAudio: v.boolean(),
    swaprMetadata: v.optional(swaprMetadataValidator),
    cliprMetadata: v.optional(cliprMetadataValidator),
    isPosted: v.optional(v.boolean()),
    postedAt: v.optional(v.string()),
    automation: v.optional(automationProvenanceValidator),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_product_created", ["ownerId", "productId", "createdAt"])
    .index("by_owner_is_posted_created", ["ownerId", "isPosted", "createdAt"])
    .index("by_owner_product_is_posted_created", [
      "ownerId",
      "productId",
      "isPosted",
      "createdAt",
    ])
    .index("by_owner_library_kind_created", [
      "ownerId",
      "libraryKind",
      "createdAt",
    ])
    .index("by_owner_product_library_kind_created", [
      "ownerId",
      "productId",
      "libraryKind",
      "createdAt",
    ])
    .index("by_owner_library_kind_is_posted_created", [
      "ownerId",
      "libraryKind",
      "isPosted",
      "createdAt",
    ])
    .index("by_owner_product_library_kind_is_posted_created", [
      "ownerId",
      "productId",
      "libraryKind",
      "isPosted",
      "createdAt",
    ])
    .index("by_owner_id", ["ownerId", "id"]),
  photoAssets: defineTable({
    ownerId: v.string(),
    id: v.string(),
    usageReservationId: v.optional(v.string()),
    productId: v.optional(v.string()),
    avatarId: v.optional(v.string()),
    name: v.string(),
    tags: assetTagsValidator,
    avatarDescription: v.optional(v.string()),
    outfitDescription: v.optional(v.string()),
    locationDescription: v.optional(v.string()),
    poseDescription: v.optional(v.string()),
    originalName: v.string(),
    photoObject: r2ObjectValidator,
    originalObject: v.optional(r2ObjectValidator),
    thumbnailObject: v.optional(r2ObjectValidator),
    mimeType: v.string(),
    originalMimeType: v.optional(v.string()),
    size: v.number(),
    originalSize: v.optional(v.number()),
    width: v.number(),
    height: v.number(),
    originalWidth: v.optional(v.number()),
    originalHeight: v.optional(v.number()),
    preparation: v.optional(
      v.union(
        v.literal("ai-outpaint"),
        v.literal("original-portrait"),
        v.literal("auto-crop"),
      ),
    ),
    automation: v.optional(automationProvenanceValidator),
    consentAcknowledgedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_product_created", ["ownerId", "productId", "createdAt"])
    .index("by_owner_avatar_created", ["ownerId", "avatarId", "createdAt"])
    .index("by_owner_avatar_product_created", [
      "ownerId",
      "avatarId",
      "productId",
      "createdAt",
    ])
    .index("by_owner_id", ["ownerId", "id"]),
  avatars: defineTable({
    ownerId: v.string(),
    id: v.string(),
    productId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    wardrobeStyle: v.optional(avatarWardrobeStyleValidator),
    cliprVoiceId: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_product_created", ["ownerId", "productId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  avatarPreferences: defineTable({
    ownerId: v.string(),
    productId: v.optional(v.string()),
    defaultAvatarId: v.optional(v.string()),
    updatedAt: v.string(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_product", ["ownerId", "productId"]),
  products: defineTable({
    ownerId: v.string(),
    id: v.string(),
    archivedAt: v.optional(v.string()),
    name: v.string(),
    productDetails: v.string(),
    audienceDetails: v.string(),
    emotionalNarrative: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    inferredProblem: v.optional(v.string()),
    inferredPainPoints: v.array(v.string()),
    eligibleCliprHookStyleKeys: v.optional(v.array(v.string())),
    eligibleCliprHookTemplateIds: v.optional(v.array(v.string())),
    cliprPlaceholderFillers: v.optional(
      v.record(v.string(), v.array(v.string())),
    ),
    preferredCliprHookStyleKey: v.optional(v.string()),
    winningHookExamples: v.optional(v.array(v.string())),
    rejectedHookExamples: v.optional(v.array(v.string())),
    hookGenerationGoal: v.optional(v.string()),
    hookEdgeLevel: v.optional(v.string()),
    defaultAvatarId: v.optional(v.string()),
    defaultDemoClipId: v.optional(v.string()),
    postBridgeSocialAccountIds: v.optional(v.array(v.number())),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  productCards: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    websiteUrl: v.optional(v.string()),
    postBridgeSocialAccountIds: v.optional(v.array(v.number())),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  postBridgeSettings: defineTable({
    ownerId: v.string(),
    encryptedApiKey: v.string(),
    apiKeyLast4: v.string(),
    lastVerifiedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_owner", ["ownerId"]),
  postBridgePostProductMappings: defineTable({
    ownerId: v.string(),
    productId: v.string(),
    postId: v.string(),
    sourceId: v.string(),
    sourceType: postBridgeSourceTypeValidator,
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_product", ["ownerId", "productId"])
    .index("by_owner_post", ["ownerId", "postId"])
    .index("by_owner_source", ["ownerId", "sourceType", "sourceId"]),
  productPreferences: defineTable({
    ownerId: v.string(),
    defaultProductId: v.optional(v.string()),
    onboardingCompletedAt: v.optional(v.string()),
    updatedAt: v.string(),
  }).index("by_owner", ["ownerId"]),
  cliDeviceAuthorizations: defineTable({
    id: v.string(),
    deviceCodeHash: v.string(),
    userCode: v.string(),
    status: cliDeviceAuthorizationStatusValidator,
    ownerId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    clientName: v.optional(v.string()),
    machineName: v.optional(v.string()),
    expiresAt: v.string(),
    approvedAt: v.optional(v.string()),
    consumedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_device_code_hash", ["deviceCodeHash"])
    .index("by_user_code", ["userCode"])
    .index("by_status_expires", ["status", "expiresAt"]),
  cliSessions: defineTable({
    ownerId: v.string(),
    id: v.string(),
    tokenHash: v.string(),
    clientName: v.optional(v.string()),
    machineName: v.optional(v.string()),
    expiresAt: v.string(),
    revokedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  soundPreferences: defineTable({
    ownerId: v.string(),
    rightsAcceptedAt: v.optional(v.string()),
    rightsAgreementVersion: v.optional(v.string()),
    updatedAt: v.string(),
  }).index("by_owner", ["ownerId"]),
  stitches: defineTable({
    ownerId: v.string(),
    id: v.string(),
    usageReservationId: v.optional(v.string()),
    productId: v.optional(v.string()),
    mode: v.optional(stitchrModeValidator),
    name: v.string(),
    ugcClipId: v.string(),
    demoClipId: v.string(),
    ugcClipName: v.string(),
    demoClipName: v.string(),
    ugcTrimRange: v.optional(videoTrimRangeValidator),
    demoTrimRange: v.optional(videoTrimRangeValidator),
    demoQuickEdit: v.optional(quickEditSuggestionsValidator),
    quickEdit: v.optional(quickEditMetadataValidator),
    ugcQuickEdit: v.optional(quickEditSuggestionsValidator),
    sequenceSegments: v.optional(v.array(stitchSequenceSegmentValidator)),
    stitchObject: v.optional(r2ObjectValidator),
    posterObject: v.optional(r2ObjectValidator),
    posterVersion: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    size: v.optional(v.number()),
    width: v.number(),
    height: v.number(),
    duration: v.number(),
    includeDemoAudio: v.optional(v.boolean()),
    includeUgcAudio: v.optional(v.boolean()),
    demoPlaybackRate: v.optional(videoPlaybackRateValidator),
    ugcPlaybackRate: v.optional(videoPlaybackRateValidator),
    music: v.optional(stitchMusicMetadataValidator),
    textOverlay: v.optional(textOverlayValidator),
    textOverlays: v.optional(textOverlaysValidator),
    socialCaption: v.optional(v.string()),
    stitchScore: v.optional(stitchScoreValidator),
    firstStitchScore: v.optional(stitchScoreValidator),
    postBridgePosts: v.optional(v.array(postBridgePostReferenceValidator)),
    isPosted: v.optional(v.boolean()),
    postedAt: v.optional(v.string()),
    automation: v.optional(automationProvenanceValidator),
    hookLabIdeaId: v.optional(v.string()),
    hookLabIdeaUseId: v.optional(v.string()),
    hookLabIdeaVariantIndex: v.optional(v.number()),
    createdAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_product_created", ["ownerId", "productId", "createdAt"])
    .index("by_owner_is_posted_created", ["ownerId", "isPosted", "createdAt"])
    .index("by_owner_product_is_posted_created", [
      "ownerId",
      "productId",
      "isPosted",
      "createdAt",
    ])
    .index("by_owner_id", ["ownerId", "id"]),
  stitchCards: defineTable({
    ownerId: v.string(),
    id: v.string(),
    productId: v.optional(v.string()),
    mode: v.optional(stitchrModeValidator),
    name: v.string(),
    ugcClipId: v.string(),
    demoClipId: v.string(),
    ugcClipName: v.string(),
    demoClipName: v.string(),
    ugcTrimRange: v.optional(videoTrimRangeValidator),
    demoTrimRange: v.optional(videoTrimRangeValidator),
    demoQuickEdit: v.optional(quickEditSuggestionsValidator),
    quickEdit: v.optional(quickEditMetadataValidator),
    ugcQuickEdit: v.optional(quickEditSuggestionsValidator),
    sequenceSegments: v.optional(v.array(stitchSequenceSegmentValidator)),
    stitchObject: v.optional(r2ObjectValidator),
    posterObject: v.optional(r2ObjectValidator),
    posterVersion: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    size: v.optional(v.number()),
    width: v.number(),
    height: v.number(),
    duration: v.number(),
    includeDemoAudio: v.optional(v.boolean()),
    includeUgcAudio: v.optional(v.boolean()),
    demoPlaybackRate: v.optional(videoPlaybackRateValidator),
    ugcPlaybackRate: v.optional(videoPlaybackRateValidator),
    music: v.optional(stitchMusicMetadataValidator),
    textOverlay: v.optional(textOverlayValidator),
    textOverlays: v.optional(textOverlaysValidator),
    socialCaption: v.optional(v.string()),
    stitchScore: v.optional(stitchScoreValidator),
    firstStitchScore: v.optional(stitchScoreValidator),
    postBridgePosts: v.optional(v.array(postBridgePostReferenceValidator)),
    isPosted: v.optional(v.boolean()),
    postedAt: v.optional(v.string()),
    automation: v.optional(automationProvenanceValidator),
    createdAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_product_created", ["ownerId", "productId", "createdAt"])
    .index("by_owner_is_posted_created", ["ownerId", "isPosted", "createdAt"])
    .index("by_owner_product_is_posted_created", [
      "ownerId",
      "productId",
      "isPosted",
      "createdAt",
    ])
    .index("by_owner_id", ["ownerId", "id"]),
  stitchTemplates: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    sourceStitchId: v.string(),
    sourceStitchName: v.string(),
    mode: v.optional(stitchrModeValidator),
    ugcClipId: v.string(),
    demoClipId: v.string(),
    ugcClipName: v.string(),
    demoClipName: v.string(),
    ugcTrimRange: v.optional(videoTrimRangeValidator),
    demoTrimRange: v.optional(videoTrimRangeValidator),
    sequenceSegments: v.optional(v.array(stitchSequenceSegmentValidator)),
    width: v.number(),
    height: v.number(),
    duration: v.number(),
    includeDemoAudio: v.optional(v.boolean()),
    includeUgcAudio: v.optional(v.boolean()),
    demoPlaybackRate: v.optional(videoPlaybackRateValidator),
    ugcPlaybackRate: v.optional(videoPlaybackRateValidator),
    textOverlay: v.optional(textOverlayValidator),
    textOverlays: v.optional(textOverlaysValidator),
    socialCaption: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_source_stitch", ["ownerId", "sourceStitchId"])
    .index("by_owner_id", ["ownerId", "id"]),
  stitchrHookPlans: defineTable({
    ownerId: v.string(),
    id: v.string(),
    productId: v.optional(v.string()),
    productName: v.optional(v.string()),
    automationRunId: v.optional(v.string()),
    automationTaskId: v.optional(v.string()),
    stitchId: v.optional(v.string()),
    ugcClipId: v.optional(v.string()),
    ugcClipName: v.optional(v.string()),
    demoClipId: v.optional(v.string()),
    demoClipName: v.optional(v.string()),
    status: stitchrHookPlanStatusValidator,
    source: stitchrHookPlanSourceValidator,
    selectedHook: v.string(),
    hookOptions: v.array(stitchrHookVariantValidator),
    caption: v.optional(v.string()),
    hashtags: v.array(v.string()),
    socialCaption: v.optional(v.string()),
    angle: v.optional(v.string()),
    reason: v.optional(v.string()),
    providerModel: v.optional(v.string()),
    providerPredictionId: v.optional(v.string()),
    feedbackStatus: v.optional(stitchrHookFeedbackStatusValidator),
    acceptedAt: v.optional(v.string()),
    rejectedAt: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_product_created", ["ownerId", "productId", "createdAt"])
    .index("by_owner_feedback_created", [
      "ownerId",
      "feedbackStatus",
      "createdAt",
    ])
    .index("by_owner_id", ["ownerId", "id"])
    .index("by_owner_stitch_created", ["ownerId", "stitchId", "createdAt"])
    .index("by_owner_task", ["ownerId", "automationTaskId"]),
  stitchrHookOptions: defineTable({
    ownerId: v.string(),
    id: v.string(),
    planId: v.string(),
    productId: v.optional(v.string()),
    productName: v.optional(v.string()),
    stitchId: v.optional(v.string()),
    rank: v.number(),
    hook: v.string(),
    normalizedHook: v.string(),
    angle: v.string(),
    reason: v.string(),
    isSelected: v.boolean(),
    reviewState: hookLabReviewStateValidator,
    reviewedAt: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    linkedIdeaId: v.optional(v.string()),
    planSource: stitchrHookPlanSourceValidator,
    planCreatedAt: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_review_created", ["ownerId", "reviewState", "createdAt"])
    .index("by_owner_product_created", ["ownerId", "productId", "createdAt"])
    .index("by_owner_product_review_created", [
      "ownerId",
      "productId",
      "reviewState",
      "createdAt",
    ])
    .index("by_owner_plan_rank", ["ownerId", "planId", "rank"])
    .index("by_owner_id", ["ownerId", "id"]),
  hookLabIdeas: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    searchText: v.string(),
    sortKey: v.string(),
    status: hookLabIdeaStatusValidator,
    sourceType: hookLabIdeaSourceTypeValidator,
    sourcePlatform: v.optional(
      v.union(v.literal("tiktok"), v.literal("instagram")),
    ),
    canonicalUrl: v.optional(v.string()),
    sourcePostId: v.optional(v.string()),
    sourceCreatedAt: v.optional(v.string()),
    attributionName: v.optional(v.string()),
    attributionUrl: v.optional(v.string()),
    thumbnailObject: v.optional(r2ObjectValidator),
    scope: hookLabIdeaScopeValidator,
    productId: v.optional(v.string()),
    originalText: v.optional(v.string()),
    textBlueprint: v.optional(hookLabTextBlueprintValidator),
    creativeBeat: v.optional(hookLabCreativeBeatValidator),
    stitchRecipe: v.optional(hookLabStitchRecipeValidator),
    sourceStitchId: v.optional(v.string()),
    sourceTemplateId: v.optional(v.string()),
    sourceHookOptionId: v.optional(v.string()),
    whatToRepeat: v.optional(v.string()),
    useCount: v.number(),
    lastUsedAt: v.optional(v.string()),
    migrationKey: v.optional(v.string()),
    requestKey: v.optional(v.string()),
    analysisModel: v.optional(v.string()),
    providerPredictionId: v.optional(v.string()),
    providerRunRequestedAt: v.optional(v.string()),
    providerRunId: v.optional(v.string()),
    providerDatasetId: v.optional(v.string()),
    promptVersion: v.optional(v.string()),
    analysisVersion: v.optional(v.string()),
    failureCode: v.optional(v.string()),
    failureMessage: v.optional(v.string()),
    archivedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_sort", ["ownerId", "sortKey"])
    .index("by_owner_scope_created", ["ownerId", "scope", "createdAt"])
    .index("by_owner_scope_sort", ["ownerId", "scope", "sortKey"])
    .index("by_owner_product_created", ["ownerId", "productId", "createdAt"])
    .index("by_owner_product_sort", ["ownerId", "productId", "sortKey"])
    .index("by_owner_status_created", ["ownerId", "status", "createdAt"])
    .index("by_owner_canonical_url", ["ownerId", "canonicalUrl"])
    .index("by_owner_source_stitch", ["ownerId", "sourceStitchId"])
    .index("by_owner_source_template", ["ownerId", "sourceTemplateId"])
    .index("by_owner_source_hook_option", ["ownerId", "sourceHookOptionId"])
    .index("by_owner_migration_key", ["ownerId", "migrationKey"])
    .index("by_owner_request_key", ["ownerId", "requestKey"])
    .index("by_owner_id", ["ownerId", "id"])
    .searchIndex("search_ideas", {
      searchField: "searchText",
      filterFields: ["ownerId", "scope", "productId", "status"],
    }),
  hookLabIdeaUses: defineTable({
    ownerId: v.string(),
    id: v.string(),
    ideaId: v.string(),
    productId: v.string(),
    variationCount: v.number(),
    defaultAvatarId: v.string(),
    defaultDemoClipId: v.string(),
    status: hookLabIdeaUseStatusValidator,
    progress: v.number(),
    completedVariantCount: v.number(),
    failedVariantCount: v.number(),
    failureMessage: v.optional(v.string()),
    idempotencyKey: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
    countedAt: v.optional(v.string()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_idea_created", ["ownerId", "ideaId", "createdAt"])
    .index("by_owner_idempotency", ["ownerId", "idempotencyKey"])
    .index("by_owner_id", ["ownerId", "id"]),
  hookLabIdeaVariants: defineTable({
    ownerId: v.string(),
    id: v.string(),
    ideaId: v.string(),
    useId: v.string(),
    productId: v.string(),
    variantIndex: v.number(),
    status: hookLabIdeaVariantStatusValidator,
    textDecision: v.optional(hookLabTextDecisionValidator),
    textDecisionReason: v.optional(v.string()),
    generatedHook: v.optional(v.string()),
    generatedCaption: v.optional(v.string()),
    visualPrompt: v.optional(v.string()),
    visualPromptSummary: v.optional(v.string()),
    providerJobId: v.optional(v.string()),
    providerPredictionIds: v.array(v.string()),
    generatedImageObject: v.optional(r2ObjectValidator),
    generatedVideoObject: v.optional(r2ObjectValidator),
    generatedUgcClipId: v.optional(v.string()),
    finishedStitchId: v.optional(v.string()),
    failureCode: v.optional(v.string()),
    failureMessage: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_status_created", ["ownerId", "status", "createdAt"])
    .index("by_owner_use_variant", ["ownerId", "useId", "variantIndex"])
    .index("by_owner_idea_created", ["ownerId", "ideaId", "createdAt"])
    .index("by_owner_finished_stitch", ["ownerId", "finishedStitchId"])
    .index("by_owner_generated_ugc", ["ownerId", "generatedUgcClipId"])
    .index("by_owner_id", ["ownerId", "id"]),
  sharedMusicTracks: defineTable({
    id: v.string(),
    uploadedByOwnerId: v.string(),
    title: v.string(),
    tags: assetTagsValidator,
    style: v.optional(v.string()),
    durationSeconds: v.number(),
    audioObject: r2ObjectValidator,
    ownerAudioObject: v.optional(r2ObjectValidator),
    mimeType: v.string(),
    size: v.number(),
    prompt: v.optional(v.string()),
    providerModel: v.optional(v.string()),
    providerPredictionId: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    source: musicTrackSourceValidator,
    tiktokMusicId: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_created", ["createdAt"])
    .index("by_uploaded_owner_created", ["uploadedByOwnerId", "createdAt"])
    .index("by_uploaded_owner_music_id", ["uploadedByOwnerId", "id"])
    .index("by_music_id", ["id"]),
  swiprBackgrounds: defineTable({
    id: v.string(),
    uploadedByOwnerId: v.string(),
    name: v.string(),
    tags: assetTagsValidator,
    description: v.optional(v.string()),
    details: v.optional(v.string()),
    libraryQuery: v.optional(v.string()),
    libraryQueryKey: v.optional(v.string()),
    pexelsPhotoId: v.optional(v.number()),
    source: swiprBackgroundSourceValidator,
    imageObject: r2ObjectValidator,
    mimeType: v.string(),
    size: v.number(),
    width: v.number(),
    height: v.number(),
    createdAt: v.string(),
  })
    .index("by_created", ["createdAt"])
    .index("by_uploaded_owner_created", ["uploadedByOwnerId", "createdAt"])
    .index("by_source_created", ["source", "createdAt"])
    .index("by_source_library_query_created", [
      "source",
      "libraryQueryKey",
      "createdAt",
    ])
    .index("by_source_pexels_photo", ["source", "pexelsPhotoId"])
    .index("by_background_id", ["id"]),
  swiprBackgroundCards: defineTable({
    id: v.string(),
    uploadedByOwnerId: v.string(),
    name: v.string(),
    tags: assetTagsValidator,
    description: v.optional(v.string()),
    searchText: v.string(),
    libraryQuery: v.optional(v.string()),
    libraryQueryKey: v.optional(v.string()),
    pexelsPhotoId: v.optional(v.number()),
    source: swiprBackgroundSourceValidator,
    imageObject: r2ObjectValidator,
    mimeType: v.string(),
    size: v.number(),
    width: v.number(),
    height: v.number(),
    createdAt: v.string(),
  })
    .index("by_created", ["createdAt"])
    .index("by_uploaded_owner_created", ["uploadedByOwnerId", "createdAt"])
    .index("by_source_created", ["source", "createdAt"])
    .index("by_source_library_query_created", [
      "source",
      "libraryQueryKey",
      "createdAt",
    ])
    .index("by_source_pexels_photo", ["source", "pexelsPhotoId"])
    .index("by_background_id", ["id"]),
  swiprLibraryPackAccounts: defineTable({
    ownerId: v.string(),
    libraryQuery: v.string(),
    libraryQueryKey: v.string(),
    createdAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_query", ["ownerId", "libraryQueryKey"])
    .index("by_query_key", ["libraryQueryKey"]),
  swiprLibraryPackPhotoExclusions: defineTable({
    ownerId: v.string(),
    backgroundId: v.string(),
    libraryQuery: v.string(),
    libraryQueryKey: v.string(),
    createdAt: v.string(),
  })
    .index("by_owner_background", ["ownerId", "backgroundId"])
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_query", ["ownerId", "libraryQueryKey"]),
  swipes: defineTable({
    ownerId: v.string(),
    id: v.string(),
    usageReservationId: v.optional(v.string()),
    name: v.string(),
    productSourceType: swiprProductSourceTypeValidator,
    productSourceId: v.string(),
    productContext: v.string(),
    productName: v.string(),
    backgroundId: v.string(),
    caption: v.optional(v.string()),
    description: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    rationale: v.optional(v.string()),
    socialCaption: v.optional(v.string()),
    slides: v.array(swiprSlideValidator),
    posterObject: v.optional(r2ObjectValidator),
    posterVersion: v.optional(v.number()),
    postBridgePosts: v.optional(v.array(postBridgePostReferenceValidator)),
    isPosted: v.optional(v.boolean()),
    postedAt: v.optional(v.string()),
    automation: v.optional(automationProvenanceValidator),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_updated", ["ownerId", "updatedAt"])
    .index("by_owner_is_posted_updated", ["ownerId", "isPosted", "updatedAt"])
    .index("by_owner_product_updated", [
      "ownerId",
      "productSourceId",
      "updatedAt",
    ])
    .index("by_owner_product_is_posted_updated", [
      "ownerId",
      "productSourceId",
      "isPosted",
      "updatedAt",
    ])
    .index("by_owner_id", ["ownerId", "id"]),
  swipeCards: defineTable({
    ownerId: v.string(),
    id: v.string(),
    name: v.string(),
    productSourceType: swiprProductSourceTypeValidator,
    productSourceId: v.string(),
    productContext: v.string(),
    productName: v.string(),
    backgroundId: v.string(),
    caption: v.optional(v.string()),
    description: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    socialCaption: v.optional(v.string()),
    slides: v.array(swiprSlideValidator),
    searchText: v.string(),
    posterObject: v.optional(r2ObjectValidator),
    posterVersion: v.optional(v.number()),
    postBridgePosts: v.optional(v.array(postBridgePostReferenceValidator)),
    isPosted: v.optional(v.boolean()),
    postedAt: v.optional(v.string()),
    automation: v.optional(automationProvenanceValidator),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_updated", ["ownerId", "updatedAt"])
    .index("by_owner_is_posted_updated", ["ownerId", "isPosted", "updatedAt"])
    .index("by_owner_product_updated", [
      "ownerId",
      "productSourceId",
      "updatedAt",
    ])
    .index("by_owner_product_is_posted_updated", [
      "ownerId",
      "productSourceId",
      "isPosted",
      "updatedAt",
    ])
    .index("by_owner_id", ["ownerId", "id"]),
  replicateJobs: defineTable({
    ownerId: v.string(),
    predictionId: v.string(),
    usageReservationId: v.optional(v.string()),
    purpose: replicateJobPurposeValidator,
    modelId: v.string(),
    status: replicatePredictionStatusValidator,
    outputUrl: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_prediction", ["ownerId", "predictionId"]),
  cliprJobs: defineTable({
    ownerId: v.string(),
    id: v.string(),
    usageReservationId: v.optional(v.string()),
    productId: v.string(),
    productName: v.string(),
    productDetails: v.string(),
    audienceDetails: v.string(),
    productInferredProblem: v.optional(v.string()),
    productInferredPainPoints: v.array(v.string()),
    avatarId: v.string(),
    avatarName: v.string(),
    avatarPhotoId: v.string(),
    demoClipId: v.optional(v.string()),
    demoClipName: v.optional(v.string()),
    voiceId: v.string(),
    requestedGenerationMode: v.optional(cliprGenerationModeValidator),
    generationMode: v.optional(cliprResolvedGenerationModeValidator),
    requestedVideoModelId: v.optional(cliprVideoModelIdValidator),
    videoModelId: v.optional(cliprVideoModelIdValidator),
    scriptIdea: v.optional(v.string()),
    targetDurationSeconds: cliprDurationSecondsValidator,
    avatarImageObject: v.optional(r2ObjectValidator),
    avatarVideoObject: v.optional(r2ObjectValidator),
    avatarImageProviderPredictionId: v.optional(v.string()),
    avatarVideoProviderPredictionId: v.optional(v.string()),
    music: v.optional(cliprMusicMetadataValidator),
    hookStyleKey: v.optional(v.string()),
    hookTemplateId: v.optional(v.string()),
    filledHook: v.optional(v.string()),
    variablesUsed: v.optional(v.record(v.string(), v.string())),
    script: v.optional(v.string()),
    scenePlan: v.array(cliprScenePlanValidator),
    providerModels: v.array(v.string()),
    status: cliprJobStatusValidator,
    stage: cliprJobStageValidator,
    progress: v.number(),
    finalClipId: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
    finalizedAt: v.optional(v.string()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  cliprJobSummaries: defineTable({
    ownerId: v.string(),
    id: v.string(),
    usageReservationId: v.optional(v.string()),
    productId: v.string(),
    productName: v.string(),
    avatarId: v.string(),
    avatarPhotoId: v.string(),
    demoClipId: v.optional(v.string()),
    demoClipName: v.optional(v.string()),
    avatarImageObject: v.optional(r2ObjectValidator),
    avatarVideoObject: v.optional(r2ObjectValidator),
    avatarImageProviderPredictionId: v.optional(v.string()),
    avatarVideoProviderPredictionId: v.optional(v.string()),
    music: v.optional(cliprMusicMetadataValidator),
    voiceId: v.string(),
    requestedGenerationMode: v.optional(cliprGenerationModeValidator),
    generationMode: v.optional(cliprResolvedGenerationModeValidator),
    requestedVideoModelId: v.optional(cliprVideoModelIdValidator),
    videoModelId: v.optional(cliprVideoModelIdValidator),
    scriptIdea: v.optional(v.string()),
    targetDurationSeconds: cliprDurationSecondsValidator,
    filledHook: v.optional(v.string()),
    status: cliprJobStatusValidator,
    stage: cliprJobStageValidator,
    progress: v.number(),
    finalClipId: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"]),
  cliprUserPreferences: defineTable({
    ownerId: v.string(),
    defaultVoiceId: v.string(),
    updatedAt: v.string(),
  }).index("by_owner", ["ownerId"]),
  mediaJobs: defineTable({
    ownerId: v.string(),
    id: v.string(),
    usageReservationId: v.optional(v.string()),
    generationSlotId: v.optional(v.string()),
    jobType: mediaJobTypeValidator,
    status: mediaJobStatusValidator,
    stage: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    outputAssetIds: v.array(v.string()),
    attempt: v.number(),
    lockedBy: v.optional(v.string()),
    lockedUntil: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"])
    .index("by_owner_status_created", ["ownerId", "status", "createdAt"])
    .index("by_status_created", ["status", "createdAt"])
    .index("by_status_job_type_created", ["status", "jobType", "createdAt"])
    .index("by_status_job_type_stage_created", [
      "status",
      "jobType",
      "stage",
      "createdAt",
    ])
    .index("by_idempotency_key", ["idempotencyKey"]),
  providerJobs: defineTable({
    ownerId: v.string(),
    id: v.string(),
    usageReservationId: v.optional(v.string()),
    usageReservationIds: v.optional(v.array(v.string())),
    generationSlotId: v.optional(v.string()),
    jobType: providerJobTypeValidator,
    status: providerJobStatusValidator,
    stage: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    outputAssetIds: v.array(v.string()),
    providerJobIds: v.array(v.string()),
    mediaJobIds: v.array(v.string()),
    progress: v.number(),
    attempt: v.number(),
    lockedBy: v.optional(v.string()),
    lockedUntil: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"])
    .index("by_owner_status", ["ownerId", "status"])
    .index("by_owner_status_created", ["ownerId", "status", "createdAt"])
    .index("by_status_created", ["status", "createdAt"])
    .index("by_status_job_type_created", ["status", "jobType", "createdAt"])
    .index("by_status_job_type_stage_created", [
      "status",
      "jobType",
      "stage",
      "createdAt",
    ])
    .index("by_idempotency_key", ["idempotencyKey"]),
  workerJobSummaries: defineTable({
    ownerId: v.string(),
    id: v.string(),
    worker: v.union(v.literal("media"), v.literal("provider")),
    jobType: v.string(),
    status: v.string(),
    stage: v.string(),
    outputAssetIds: v.array(v.string()),
    providerJobIds: v.optional(v.array(v.string())),
    mediaJobIds: v.optional(v.array(v.string())),
    progress: v.optional(v.number()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_owner_worker_status_created", [
      "ownerId",
      "worker",
      "status",
      "createdAt",
    ])
    .index("by_worker_job_id", ["worker", "id"])
    .index("by_owner_id", ["ownerId", "id"]),
  workerLaunchState: defineTable({
    worker: v.union(v.literal("media"), v.literal("provider")),
    lastRequestedAt: v.string(),
    lastCoalescedFollowupRequestedAt: v.optional(v.string()),
    lastRecoveryRequestedAt: v.optional(v.string()),
    updatedAt: v.string(),
  }).index("by_worker", ["worker"]),
  notifications: defineTable({
    ownerId: v.string(),
    productId: v.optional(v.string()),
    id: v.string(),
    dedupeKey: v.string(),
    sourceType: notificationSourceTypeValidator,
    sourceId: v.optional(v.string()),
    title: v.string(),
    preview: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    readAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_dedupe", ["ownerId", "dedupeKey"])
    .index("by_owner_id", ["ownerId", "id"])
    .index("by_owner_is_read_created", ["ownerId", "isRead", "createdAt"]),
  notificationSummaries: defineTable({
    ownerId: v.string(),
    unreadCount: v.number(),
    updatedAt: v.string(),
  }).index("by_owner", ["ownerId"]),
  automationPreferences: defineTable({
    ownerId: v.string(),
    productId: v.optional(v.string()),
    enabled: v.boolean(),
    enabledTools: v.array(automationToolValidator),
    cliprGenerationMode: v.optional(automationCliprGenerationModeValidator),
    stitchrGenerationCount: v.optional(automationGenerationCountValidator),
    stitchrTextStyleChoice: v.optional(
      automationStitchrTextStyleChoiceValidator,
    ),
    stitchrTextColorChoice: v.optional(v.string()),
    stitchrTextBackgroundColorChoice: v.optional(v.string()),
    stitchrTextStrokeColorChoice: v.optional(v.string()),
    stitchrTemplateAllocations: v.optional(
      v.array(automationStitchrTemplateAllocationValidator),
    ),
    swiprGenerationCount: v.optional(automationGenerationCountValidator),
    swiprCallToActionStyle: v.optional(swiprCallToActionStyleValidator),
    swiprCreativeContext: v.optional(v.string()),
    swiprSelectedLibraryPackNames: v.optional(v.array(v.string())),
    swiprTextStyleChoice: v.optional(automationStitchrTextStyleChoiceValidator),
    swiprTextColorChoice: v.optional(v.string()),
    swiprTextBackgroundColorChoice: v.optional(v.string()),
    swiprTextStrokeColorChoice: v.optional(v.string()),
    productSelectionMode: automationSelectionModeValidator,
    selectedProductIds: v.array(v.string()),
    avatarSelectionMode: automationSelectionModeValidator,
    selectedAvatarIds: v.array(v.string()),
    preferenceVersion: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_product", ["ownerId", "productId"])
    .index("by_enabled_owner_product", ["enabled", "ownerId", "productId"]),
  automationRuns: defineTable({
    ownerId: v.string(),
    productId: v.optional(v.string()),
    id: v.string(),
    automationDate: v.string(),
    tool: automationToolValidator,
    status: automationRunStatusValidator,
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    dailyLimit: v.number(),
    attempt: v.number(),
    startedAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    skippedAt: v.optional(v.string()),
    failedAt: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_product_created", ["ownerId", "productId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"])
    .index("by_owner_date_tool", ["ownerId", "automationDate", "tool"])
    .index("by_idempotency_key", ["idempotencyKey"]),
  automationRunSummaries: defineTable({
    ownerId: v.string(),
    productId: v.optional(v.string()),
    id: v.string(),
    automationDate: v.string(),
    tool: automationToolValidator,
    status: automationRunStatusValidator,
    dailyLimit: v.number(),
    attempt: v.number(),
    startedAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    skippedAt: v.optional(v.string()),
    failedAt: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_product_created", ["ownerId", "productId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"])
    .index("by_owner_date_tool", ["ownerId", "automationDate", "tool"]),
  automationTasks: defineTable({
    ownerId: v.string(),
    productId: v.optional(v.string()),
    id: v.string(),
    usageReservationId: v.optional(v.string()),
    usageReservationIds: v.optional(v.array(v.string())),
    generationSlotId: v.optional(v.string()),
    runId: v.string(),
    tool: automationToolValidator,
    taskType: automationTaskTypeValidator,
    status: automationTaskStatusValidator,
    stage: v.string(),
    idempotencyKey: v.string(),
    inputSnapshotJson: v.string(),
    outputAssetIds: v.array(v.string()),
    providerJobIds: v.array(v.string()),
    mediaJobIds: v.array(v.string()),
    attempt: v.number(),
    lockedBy: v.optional(v.string()),
    lockedUntil: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"])
    .index("by_owner_status", ["ownerId", "status"])
    .index("by_status_created", ["status", "createdAt"])
    .index("by_status_tool_created", ["status", "tool", "createdAt"])
    .index("by_status_tool_stage_created", [
      "status",
      "tool",
      "stage",
      "createdAt",
    ])
    .index("by_run", ["runId"])
    .index("by_run_status", ["runId", "status"])
    .index("by_idempotency_key", ["idempotencyKey"]),
  automationTaskSummaries: defineTable({
    ownerId: v.string(),
    productId: v.optional(v.string()),
    id: v.string(),
    runId: v.string(),
    tool: automationToolValidator,
    taskType: automationTaskTypeValidator,
    status: automationTaskStatusValidator,
    stage: v.string(),
    outputAssetIds: v.array(v.string()),
    providerJobIds: v.array(v.string()),
    mediaJobIds: v.array(v.string()),
    attempt: v.number(),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_owner_id", ["ownerId", "id"])
    .index("by_owner_status", ["ownerId", "status"])
    .index("by_run", ["runId"])
    .index("by_run_status", ["runId", "status"]),
  automationPairHistory: defineTable({
    ownerId: v.string(),
    ugcClipId: v.string(),
    demoClipId: v.string(),
    lastUsedAt: v.string(),
    useCount: v.number(),
    recentUseWindowKey: v.string(),
    lastOutputStitchId: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_pair", ["ownerId", "ugcClipId", "demoClipId"])
    .index("by_owner_last_used", ["ownerId", "lastUsedAt"]),
  stitchrBatchPairHistory: defineTable({
    ownerId: v.string(),
    ugcClipId: v.string(),
    demoClipId: v.string(),
    lastUsedAt: v.string(),
    useCount: v.number(),
    recentUseWindowKey: v.string(),
    lastOutputStitchId: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner_pair", ["ownerId", "ugcClipId", "demoClipId"])
    .index("by_owner_last_used", ["ownerId", "lastUsedAt"]),
});
