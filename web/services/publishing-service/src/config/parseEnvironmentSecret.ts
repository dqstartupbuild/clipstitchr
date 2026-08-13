import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";

export const parseEnvironmentSecret = (
  value: string | undefined,
  fieldName: string,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value.length < 8 || value.length > 4_096 || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new PublishingServiceConfigurationError(fieldName);
  }

  return value;
};
