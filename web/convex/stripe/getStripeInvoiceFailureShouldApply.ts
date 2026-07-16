export function getStripeInvoiceFailureShouldApply(
  latestPaymentEventCreatedAt: number,
  incomingEventCreatedAt: number,
) {
  return latestPaymentEventCreatedAt < incomingEventCreatedAt;
}
