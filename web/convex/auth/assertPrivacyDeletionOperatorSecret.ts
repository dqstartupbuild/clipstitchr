import { getConstantTimeStringsAreEqual } from "../../lib/clipstitchr/email/confirmation/getConstantTimeStringsAreEqual";

export function assertPrivacyDeletionOperatorSecret(secret: string) {
  const expectedSecret = process.env.PRIVACY_DELETION_OPERATOR_SECRET;

  if (
    !expectedSecret ||
    !getConstantTimeStringsAreEqual(secret, expectedSecret)
  ) {
    throw new Error("Not authorized to delete marketing contact data.");
  }
}
