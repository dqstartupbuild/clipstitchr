import type { LoopsTeamEnvironment } from "./LoopsTeamEnvironment";

export function isAllowedLoopsRecipient(
  email: string,
  teamEnvironment: LoopsTeamEnvironment,
  developmentRecipientList: string | undefined,
) {
  if (teamEnvironment === "production") {
    return true;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const allowedRecipients = (developmentRecipientList ?? "")
    .split(",")
    .map((recipient) => recipient.trim().toLowerCase())
    .filter(Boolean);

  return allowedRecipients.includes(normalizedEmail);
}
