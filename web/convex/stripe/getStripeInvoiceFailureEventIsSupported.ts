export function getStripeInvoiceFailureEventIsSupported(eventType: string) {
  return (
    eventType === "invoice.finalization_failed" ||
    eventType === "invoice.payment_failed"
  );
}
