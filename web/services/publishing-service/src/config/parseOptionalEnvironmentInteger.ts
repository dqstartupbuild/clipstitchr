import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";

export const parseOptionalEnvironmentInteger = (
  value: string | undefined,
  fieldName: string,
  minimum: number,
  maximum: number,
): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (!/^\d+$/u.test(value)) {
    throw new PublishingServiceConfigurationError(fieldName);
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new PublishingServiceConfigurationError(fieldName);
  }

  return parsed;
};
