import { isAllowedLoopsRecipient } from "./isAllowedLoopsRecipient";
import type { LoopsTeamEnvironment } from "./LoopsTeamEnvironment";

export function assertLoopsRecipientAllowed(
  email: string,
  teamEnvironment: LoopsTeamEnvironment,
  developmentRecipientList: string | undefined,
) {
  if (
    !isAllowedLoopsRecipient(
      email,
      teamEnvironment,
      developmentRecipientList,
    )
  ) {
    throw new Error("Loops recipient is not allowed in this environment.");
  }
}
