export function createStripePaymentHoldId(
  kind: "refund" | "dispute",
  chargeId: string,
) {
  return `${kind}:${chargeId}`;
}
