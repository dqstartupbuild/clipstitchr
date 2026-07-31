import { SocialApiError } from "./SocialApiError";

export function getSocialPublishErrorCode(error: unknown) {
  if (!(error instanceof SocialApiError)) {
    return undefined;
  }

  return error.providerCode ?? `provider_http_${error.responseStatus}`;
}
