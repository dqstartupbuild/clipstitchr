export type EmailConfirmationToken = Readonly<{
  expiresAt: number;
  tokenDigest: string;
  tokenRecordId: string;
  url: string;
}>;
