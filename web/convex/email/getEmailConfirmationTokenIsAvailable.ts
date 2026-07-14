import type { Doc } from "../_generated/dataModel";

export function getEmailConfirmationTokenIsAvailable({
  contact,
  expiresAt,
  inspectedAt,
  token,
  tokenDigest,
}: {
  contact: Doc<"marketingContacts"> | null;
  expiresAt: number;
  inspectedAt: number;
  token: Doc<"emailConfirmationTokens"> | null;
  tokenDigest: string;
}) {
  return Boolean(
    token &&
      contact &&
      token.tokenDigest === tokenDigest &&
      token.expiresAt === expiresAt &&
      token.expiresAt > inspectedAt &&
      token.usedAt === undefined &&
      token.supersededAt === undefined &&
      contact.deletionStatus !== "privacyDeleted" &&
      contact.suppressionStatus === "none",
  );
}
