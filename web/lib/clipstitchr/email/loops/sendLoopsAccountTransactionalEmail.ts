import type { LoopsClient } from "loops";
import { isAllowedLoopsRecipient } from "./isAllowedLoopsRecipient";
import type { AccountEmailDataVariables } from "./AccountEmailDataVariables";
import type { LoopsTeamEnvironment } from "./LoopsTeamEnvironment";
import { EmailProviderConfigurationError } from "../operations/EmailProviderConfigurationError";

type SendLoopsAccountTransactionalEmailOptions = Readonly<{
  client: Pick<LoopsClient, "sendTransactionalEmail">;
  dataVariables: AccountEmailDataVariables;
  developmentRecipientList?: string;
  idempotencyKey: string;
  recipientEmail: string;
  teamEnvironment: LoopsTeamEnvironment;
  transactionalId: string;
}>;

export function sendLoopsAccountTransactionalEmail({
  client,
  dataVariables,
  developmentRecipientList,
  idempotencyKey,
  recipientEmail,
  teamEnvironment,
  transactionalId,
}: SendLoopsAccountTransactionalEmailOptions) {
  if (
    !isAllowedLoopsRecipient(
      recipientEmail,
      teamEnvironment,
      developmentRecipientList,
    ) ||
    !idempotencyKey ||
    idempotencyKey.length > 100
  ) {
    throw new EmailProviderConfigurationError();
  }

  return client.sendTransactionalEmail({
    addToAudience: false,
    dataVariables: { ...dataVariables },
    email: recipientEmail,
    headers: { "Idempotency-Key": idempotencyKey },
    transactionalId,
  });
}
