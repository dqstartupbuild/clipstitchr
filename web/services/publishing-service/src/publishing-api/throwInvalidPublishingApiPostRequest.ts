import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";

export const throwInvalidPublishingApiPostRequest = (): never => {
  throw new PublishingServiceHttpError(400, "invalid_post_request");
};
