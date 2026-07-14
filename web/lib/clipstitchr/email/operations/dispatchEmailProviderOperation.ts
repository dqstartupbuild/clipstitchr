import type { LoopsClient } from "loops";
import { createEmailConfirmationSignature } from "../confirmation/createEmailConfirmationSignature";
import { createEmailConfirmationTokenDigest } from "../confirmation/createEmailConfirmationTokenDigest";
import { createEmailConfirmationUrl } from "../confirmation/createEmailConfirmationUrl";
import { getLoopsTransactionalId } from "../loops/getLoopsTransactionalId";
import { isAllowedLoopsRecipient } from "../loops/isAllowedLoopsRecipient";
import { isLoopsWorkflowEventName } from "../loops/isLoopsWorkflowEventName";
import type { LoopsTeamEnvironment } from "../loops/LoopsTeamEnvironment";
import { resubscribeLoopsContact } from "../loops/resubscribeLoopsContact";
import { sendLoopsConfirmationEmail } from "../loops/sendLoopsConfirmationEmail";
import { sendLoopsWorkflowEvent } from "../loops/sendLoopsWorkflowEvent";
import { upsertLoopsContact } from "../loops/upsertLoopsContact";
import { unsubscribeLoopsContact } from "../loops/unsubscribeLoopsContact";
import { EmailProviderConfigurationError } from "./EmailProviderConfigurationError";
import type { EmailProviderDispatchProjection } from "./EmailProviderDispatchProjection";

type DispatchEmailProviderOperationOptions = Readonly<{
  client: Pick<
    LoopsClient,
    "sendEvent" | "sendTransactionalEmail" | "updateContact"
  >;
  confirmationSigningSecret?: string;
  developmentRecipientList?: string;
  environment: Readonly<Record<string, string | undefined>>;
  projection: EmailProviderDispatchProjection;
  siteUrl: string;
  teamEnvironment: LoopsTeamEnvironment;
}>;

export async function dispatchEmailProviderOperation({
  client,
  confirmationSigningSecret,
  developmentRecipientList,
  environment,
  projection,
  siteUrl,
  teamEnvironment,
}: DispatchEmailProviderOperationOptions) {
  if (projection.operation.kind === "contactUnsubscribe") {
    if (
      !isAllowedLoopsRecipient(
        projection.contact.normalizedEmail,
        teamEnvironment,
        developmentRecipientList,
      )
    ) {
      throw new EmailProviderConfigurationError();
    }

    await unsubscribeLoopsContact({
      client,
      providerContactKey: projection.contact.providerContactKey,
    });
    return;
  }

  if (!projection.contact.firstTool || !projection.contact.latestTool) {
    throw new EmailProviderConfigurationError();
  }

  const contactProjection = {
    contactName: projection.contact.contactName,
    email: projection.contact.normalizedEmail,
    firstTool: projection.contact.firstTool,
    latestTool: projection.contact.latestTool,
    leadSegment: projection.contact.leadSegment,
    leadStage: projection.contact.leadStage,
    providerContactKey: projection.contact.providerContactKey,
  };
  const common = {
    client,
    developmentRecipientList,
    teamEnvironment,
  };

  if (
    !isAllowedLoopsRecipient(
      projection.contact.normalizedEmail,
      teamEnvironment,
      developmentRecipientList,
    )
  ) {
    throw new EmailProviderConfigurationError();
  }

  if (projection.operation.kind === "contactSync") {
    await upsertLoopsContact({
      ...common,
      projection: contactProjection,
    });
    return;
  }

  if (projection.operation.kind === "contactResubscribe") {
    await resubscribeLoopsContact({
      ...common,
      projection: contactProjection,
    });
    return;
  }

  if (projection.operation.kind === "workflowEvent") {
    const workflow = projection.workflow;

    if (
      !workflow?.gateMode ||
      !workflow.leadSegment ||
      !workflow.toolSource ||
      !isLoopsWorkflowEventName(workflow.workflowKey)
    ) {
      throw new EmailProviderConfigurationError();
    }

    await sendLoopsWorkflowEvent({
      ...common,
      eventName: workflow.workflowKey,
      gateMode: workflow.gateMode,
      idempotencyKey: projection.operation.operationId,
      leadSegment: workflow.leadSegment,
      providerContactKey: projection.contact.providerContactKey,
      recipientEmail: projection.contact.normalizedEmail,
      toolKey: workflow.toolSource,
      workflowVersion: workflow.workflowVersion,
    });
    return;
  }

  const confirmation = projection.confirmation;

  if (
    projection.transactionalTemplateKey !== "email-confirmation" ||
    !confirmation ||
    !confirmationSigningSecret?.trim()
  ) {
    throw new EmailProviderConfigurationError();
  }

  const signature = await createEmailConfirmationSignature(
    confirmation.tokenRecordId,
    confirmation.expiresAt,
    confirmationSigningSecret,
  );
  const tokenDigest = await createEmailConfirmationTokenDigest(signature);

  if (tokenDigest !== confirmation.tokenDigest) {
    throw new EmailProviderConfigurationError();
  }

  let transactionalId: string;

  try {
    transactionalId = getLoopsTransactionalId(
      projection.transactionalTemplateKey,
      environment,
    );
  } catch {
    throw new EmailProviderConfigurationError();
  }

  await sendLoopsConfirmationEmail({
    ...common,
    confirmationUrl: createEmailConfirmationUrl(
      siteUrl,
      confirmation.tokenRecordId,
      confirmation.expiresAt,
      signature,
    ),
    idempotencyKey: projection.operation.operationId,
    recipientEmail: projection.contact.normalizedEmail,
    transactionalId,
  });
}
