import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";

export const parseEnvironmentUrl = (
  value: string | undefined,
  fieldName: string,
  allowedProtocols: ReadonlySet<string>,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(value);

    if (!allowedProtocols.has(parsedUrl.protocol)) {
      throw new PublishingServiceConfigurationError(fieldName);
    }

    return parsedUrl.toString();
  } catch (error) {
    if (error instanceof PublishingServiceConfigurationError) {
      throw error;
    }

    throw new PublishingServiceConfigurationError(fieldName);
  }
};
