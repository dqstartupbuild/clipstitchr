export function createEmailConfirmationUrl(
  siteUrl: string,
  tokenRecordId: string,
  expiresAt: number,
  signature: string,
) {
  const url = new URL("/email/confirm", siteUrl);
  url.searchParams.set("id", tokenRecordId);
  url.searchParams.set("expires", String(expiresAt));
  url.searchParams.set("signature", signature);
  return url.toString();
}
