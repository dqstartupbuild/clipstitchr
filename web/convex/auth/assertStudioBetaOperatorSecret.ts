import { getConstantTimeStringsAreEqual } from "../../lib/clipstitchr/email/confirmation/getConstantTimeStringsAreEqual";

export function assertStudioBetaOperatorSecret(secret: string) {
  const expectedSecret = process.env.STUDIO_BETA_OPERATOR_SECRET;

  if (
    !expectedSecret ||
    !getConstantTimeStringsAreEqual(secret, expectedSecret)
  ) {
    throw new Error("Not authorized to manage Studio Beta access.");
  }
}
