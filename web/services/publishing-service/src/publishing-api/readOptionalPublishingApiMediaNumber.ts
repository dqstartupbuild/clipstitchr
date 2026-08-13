export const readOptionalPublishingApiMediaNumber = (
  value: unknown,
): number | undefined => (typeof value === "number" ? value : undefined);
