import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";

export const parsePublishingDispatchAccessSecret = (
  value: string | undefined,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (
    value.length < 32 ||
    value.length > 4_096 ||
    /[\u0000-\u001f\u007f]/u.test(value)
  ) {
    throw new PublishingServiceConfigurationError(
      "STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET",
    );
  }

  return value;
};
