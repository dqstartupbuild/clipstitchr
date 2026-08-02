import type { OAuthAuthorizationReturnPath } from "../oauth/OAuthAuthorizationReturnPath.js";

export type PublishingConnectRequest = Readonly<{
  returnPath: Extract<
    OAuthAuthorizationReturnPath,
    "/dashboard/publishing/integrations"
  >;
}>;
