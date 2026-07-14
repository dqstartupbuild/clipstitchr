import type { LoopsClient } from "loops";
import { assertLoopsRecipientAllowed } from "./assertLoopsRecipientAllowed";
import type { LoopsTeamEnvironment } from "./LoopsTeamEnvironment";

type SendLoopsConfirmationEmailOptions = Readonly<{
  client: Pick<LoopsClient, "sendTransactionalEmail">;
  confirmationUrl: string;
  developmentRecipientList?: string;
  idempotencyKey: string;
  recipientEmail: string;
  teamEnvironment: LoopsTeamEnvironment;
  transactionalId: string;
}>;

export function sendLoopsConfirmationEmail({
  client,
  confirmationUrl,
  developmentRecipientList,
  idempotencyKey,
  recipientEmail,
  teamEnvironment,
  transactionalId,
}: SendLoopsConfirmationEmailOptions) {
  assertLoopsRecipientAllowed(
    recipientEmail,
    teamEnvironment,
    developmentRecipientList,
  );

  return client.sendTransactionalEmail({
    transactionalId,
    email: recipientEmail,
    addToAudience: false,
    dataVariables: {
      confirmationUrl,
    },
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });
}
