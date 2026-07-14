import type { EmailConfirmationUrlFields } from "@/lib/clipstitchr/email/confirmation/EmailConfirmationUrlFields";

export function createEmailConfirmationVerificationUrl(
  requestUrl: string | URL,
  fields: EmailConfirmationUrlFields,
) {
  const request =
    typeof requestUrl === "string" ? new URL(requestUrl) : requestUrl;
  const verificationUrl = new URL("/email/confirm", request.origin);

  verificationUrl.searchParams.set("id", fields.tokenRecordId);
  verificationUrl.searchParams.set("expires", fields.expires);
  verificationUrl.searchParams.set("signature", fields.signature);

  return verificationUrl;
}
