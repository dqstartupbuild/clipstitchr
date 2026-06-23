import { getConstantTimeStringMatch } from "@/lib/clipstitchr/server/indexnow/getConstantTimeStringMatch";
import { getBlogPublishWebhookToken } from "./getBlogPublishWebhookToken";
import { readBearerToken } from "./readBearerToken";

export function getIsAuthorizedBlogPublishRequest(request: Request) {
  const expectedToken = getBlogPublishWebhookToken();
  const providedToken = readBearerToken(request);

  if (!providedToken) {
    return false;
  }

  return getConstantTimeStringMatch(providedToken, expectedToken);
}
