import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";

export const parsePublishingMediaSecret = (
  value: string | undefined,
  fieldName: string,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (
    Buffer.byteLength(value, "utf8") < 32 ||
    value.length > 4_096 ||
    /[\u0000-\u001f\u007f]/u.test(value)
  ) {
    throw new PublishingServiceConfigurationError(fieldName);
  }

  return value;
};
