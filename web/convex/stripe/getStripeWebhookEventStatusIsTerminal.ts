export function getStripeWebhookEventStatusIsTerminal(status: string) {
  return status === "ignored" || status === "processed";
}
