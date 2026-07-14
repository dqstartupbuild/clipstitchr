import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { emailProviderIdempotencyLifetimeMs } from "./emailProviderIdempotencyLifetimeMs";

type EnqueueEmailProviderOperationArgs = {
  contactId: Id<"marketingContacts">;
  kind:
    | "contactSync"
    | "contactResubscribe"
    | "contactUnsubscribe"
    | "workflowEvent"
    | "transactional";
  now: number;
  confirmationTokenId?: Id<"emailConfirmationTokens">;
  compensatesOperationId?: Id<"emailProviderOperations">;
  dependsOnOperationId?: Id<"emailProviderOperations">;
  enrollmentId?: Id<"marketingWorkflowEnrollments">;
  transactionalTemplateKey?: "email-confirmation";
  workflowKey?:
    | "tool_lead_captured"
    | "five_day_content_sprint_enrolled"
    | "ugc_app_ad_course_enrolled"
    | "creative_testing_workshop_enrolled";
  workflowVersion?: "v1";
  toolSource?: NonNullable<
    import("../_generated/dataModel").Doc<"marketingContacts">["latestTool"]
  >;
  gateMode?: import("../_generated/dataModel").Doc<"toolLeadCaptures">["gateMode"];
  leadSegment?: import("../_generated/dataModel").Doc<"marketingContacts">["leadSegment"];
};

export async function enqueueEmailProviderOperation(
  ctx: MutationCtx,
  args: EnqueueEmailProviderOperationArgs,
) {
  const operationId = await ctx.db.insert("emailProviderOperations", {
    contactId: args.contactId,
    kind: args.kind,
    status: "pending",
    acceptanceStatus: "notAttempted",
    deliveryStatus:
      args.kind === "transactional" ? "pending" : "notApplicable",
    ...(args.workflowKey ? { workflowKey: args.workflowKey } : {}),
    ...(args.workflowVersion
      ? { workflowVersion: args.workflowVersion }
      : {}),
    ...(args.toolSource ? { toolSource: args.toolSource } : {}),
    ...(args.gateMode ? { gateMode: args.gateMode } : {}),
    ...(args.leadSegment ? { leadSegment: args.leadSegment } : {}),
    ...(args.transactionalTemplateKey
      ? { transactionalTemplateKey: args.transactionalTemplateKey }
      : {}),
    ...(args.confirmationTokenId
      ? { confirmationTokenId: args.confirmationTokenId }
      : {}),
    ...(args.compensatesOperationId
      ? { compensatesOperationId: args.compensatesOperationId }
      : {}),
    ...(args.enrollmentId ? { enrollmentId: args.enrollmentId } : {}),
    ...(args.dependsOnOperationId
      ? { dependsOnOperationId: args.dependsOnOperationId }
      : {}),
    attemptCount: 0,
    nextAttemptAt: args.now,
    idempotencyExpiresAt: args.now + emailProviderIdempotencyLifetimeMs,
    createdAt: args.now,
    updatedAt: args.now,
  });

  await ctx.scheduler.runAfter(
    0,
    internal.email.processEmailProviderOperation.processEmailProviderOperation,
    { operationId },
  );

  return operationId;
}
