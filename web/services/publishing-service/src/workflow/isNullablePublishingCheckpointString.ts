export const isNullablePublishingCheckpointString = (
  value: unknown,
): value is string | null => value === null || typeof value === "string";
