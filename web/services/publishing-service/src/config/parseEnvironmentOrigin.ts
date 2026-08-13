import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

export const parseEnvironmentOrigin = (
  value: string | undefined,
  fieldName: string,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(value);

    if (
      !HTTP_PROTOCOLS.has(parsedUrl.protocol) ||
      parsedUrl.username.length > 0 ||
      parsedUrl.password.length > 0 ||
      parsedUrl.pathname !== "/" ||
      parsedUrl.search.length > 0 ||
      parsedUrl.hash.length > 0
    ) {
      throw new PublishingServiceConfigurationError(fieldName);
    }

    return parsedUrl.origin;
  } catch (error) {
    if (error instanceof PublishingServiceConfigurationError) {
      throw error;
    }

    throw new PublishingServiceConfigurationError(fieldName);
  }
};
