import type { LoopsClient } from "loops";
import type { LeadSegment } from "../contact/LeadSegment";
import type { PublicToolGateMode } from "../../tools/catalog/PublicToolGateMode";
import type { PublicToolKey } from "../../tools/catalog/PublicToolKey";
import { assertLoopsRecipientAllowed } from "./assertLoopsRecipientAllowed";
import { isLoopsWorkflowEventName } from "./isLoopsWorkflowEventName";
import type { LoopsTeamEnvironment } from "./LoopsTeamEnvironment";

type SendLoopsWorkflowEventOptions = Readonly<{
  client: Pick<LoopsClient, "sendEvent">;
  developmentRecipientList?: string;
  eventName: string;
  gateMode: PublicToolGateMode;
  idempotencyKey: string;
  leadSegment: LeadSegment;
  providerContactKey: string;
  recipientEmail: string;
  teamEnvironment: LoopsTeamEnvironment;
  toolKey: PublicToolKey;
  workflowVersion: "v1";
}>;

export function sendLoopsWorkflowEvent({
  client,
  developmentRecipientList,
  eventName,
  gateMode,
  idempotencyKey,
  leadSegment,
  providerContactKey,
  recipientEmail,
  teamEnvironment,
  toolKey,
  workflowVersion,
}: SendLoopsWorkflowEventOptions) {
  if (!isLoopsWorkflowEventName(eventName)) {
    throw new Error("The Loops workflow event is not approved.");
  }

  assertLoopsRecipientAllowed(
    recipientEmail,
    teamEnvironment,
    developmentRecipientList,
  );

  return client.sendEvent({
    userId: providerContactKey,
    eventName,
    eventProperties: {
      gateMode,
      leadSegment,
      toolKey,
      workflowVersion,
    },
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });
}
