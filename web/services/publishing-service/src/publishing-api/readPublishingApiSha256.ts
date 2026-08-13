import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";

export const readPublishingApiSha256 = (
  value: unknown,
  code: string,
): string => {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/u.test(value)) {
    throw new PublishingServiceHttpError(400, code);
  }

  return value;
};
