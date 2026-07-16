export function getCreditGrantAvailableAmount(grant: {
  amountConsumed: number;
  amountGranted: number;
  amountReserved: number;
  amountRevoked: number;
}) {
  return Math.max(
    0,
    grant.amountGranted -
      grant.amountReserved -
      grant.amountConsumed -
      grant.amountRevoked,
  );
}
