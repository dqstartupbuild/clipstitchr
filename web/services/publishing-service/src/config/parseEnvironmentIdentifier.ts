import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";

export const parseEnvironmentIdentifier = (
  value: string | undefined,
  fieldName: string,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value.length > 256 || /[\u0000-\u001f\u007f\s]/.test(value)) {
    throw new PublishingServiceConfigurationError(fieldName);
  }

  return value;
};
