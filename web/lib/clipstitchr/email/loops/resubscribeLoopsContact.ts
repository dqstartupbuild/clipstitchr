import type { LoopsClient } from "loops";
import { assertLoopsRecipientAllowed } from "./assertLoopsRecipientAllowed";
import { createLoopsContactProperties } from "./createLoopsContactProperties";
import type { LoopsContactProjection } from "./LoopsContactProjection";
import type { LoopsTeamEnvironment } from "./LoopsTeamEnvironment";

type ResubscribeLoopsContactOptions = Readonly<{
  client: Pick<LoopsClient, "updateContact">;
  developmentRecipientList?: string;
  projection: LoopsContactProjection;
  teamEnvironment: LoopsTeamEnvironment;
}>;

export function resubscribeLoopsContact({
  client,
  developmentRecipientList,
  projection,
  teamEnvironment,
}: ResubscribeLoopsContactOptions) {
  assertLoopsRecipientAllowed(
    projection.email,
    teamEnvironment,
    developmentRecipientList,
  );

  return client.updateContact({
    email: projection.email,
    userId: projection.providerContactKey,
    properties: {
      ...createLoopsContactProperties(projection),
      subscribed: true,
    },
  });
}
