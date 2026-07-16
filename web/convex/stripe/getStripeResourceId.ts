export function getStripeResourceId(
  resource: string | { id: string } | null | undefined,
) {
  return typeof resource === "string" ? resource : resource?.id;
}
