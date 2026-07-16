const checkoutIntentIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getCheckoutIntentIdFromSearchParam(
  value: string | string[] | undefined,
) {
  return typeof value === "string" && checkoutIntentIdPattern.test(value)
    ? value
    : undefined;
}
