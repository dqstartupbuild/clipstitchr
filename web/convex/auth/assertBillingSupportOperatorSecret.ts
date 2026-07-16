import { getConstantTimeStringsAreEqual } from "../../lib/clipstitchr/email/confirmation/getConstantTimeStringsAreEqual";

export function assertBillingSupportOperatorSecret(secret: string) {
  const expectedSecret = process.env.BILLING_SUPPORT_OPERATOR_SECRET;

  if (
    !expectedSecret ||
    !getConstantTimeStringsAreEqual(secret, expectedSecret)
  ) {
    throw new Error("Not authorized to manage billing support state.");
  }
}
