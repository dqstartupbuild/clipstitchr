import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";

export const parseEnvironmentPort = (
  value: string | undefined,
  fieldName: string,
): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (!/^\d{1,5}$/.test(value)) {
    throw new PublishingServiceConfigurationError(fieldName);
  }

  const port = Number(value);

  if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new PublishingServiceConfigurationError(fieldName);
  }

  return port;
};
