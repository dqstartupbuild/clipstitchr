const clientKeyPattern = /^[a-f0-9]{64}$/;
const digestPattern = /^[a-f0-9]{64}$/;
const opaqueIdPattern = /^[A-Za-z0-9_-]{32,128}$/;

export function validateEmailConfirmationReference(args: {
  clientKey?: string;
  expiresAt: number;
  inspectedAt: number;
  tokenDigest: string;
  tokenRecordId: string;
}) {
  return Boolean(
    (args.clientKey === undefined || clientKeyPattern.test(args.clientKey)) &&
      opaqueIdPattern.test(args.tokenRecordId) &&
      digestPattern.test(args.tokenDigest) &&
      Number.isFinite(args.expiresAt) &&
      Number.isFinite(args.inspectedAt),
  );
}
