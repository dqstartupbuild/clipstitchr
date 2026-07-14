import type { EmailConfirmationToken } from "@/lib/clipstitchr/email/confirmation/EmailConfirmationToken";
import { createEmailConfirmationSignature } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationSignature";
import { createEmailConfirmationTokenDigest } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationTokenDigest";
import { createEmailConfirmationUrl } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationUrl";
import { emailConfirmationTokenTtlMs } from "@/lib/clipstitchr/email/confirmation/emailConfirmationTokenTtlMs";

export async function createEmailConfirmationToken(
  siteUrl: string,
  signingSecret: string,
  now: number,
): Promise<EmailConfirmationToken> {
  const tokenRecordId = crypto.randomUUID();
  const expiresAt = now + emailConfirmationTokenTtlMs;
  const signature = await createEmailConfirmationSignature(
    tokenRecordId,
    expiresAt,
    signingSecret,
  );
  const tokenDigest = await createEmailConfirmationTokenDigest(signature);

  return {
    expiresAt,
    tokenDigest,
    tokenRecordId,
    url: createEmailConfirmationUrl(
      siteUrl,
      tokenRecordId,
      expiresAt,
      signature,
    ),
  };
}
