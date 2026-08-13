export const readOptionalPublishingApiMediaString = (
  value: unknown,
): string | undefined => (typeof value === "string" ? value : undefined);
