export const OAUTH_AUTHORIZATION_RETURN_PATHS = [
  "/dashboard/publishing",
  "/dashboard/publishing/integrations",
  "/dashboard/publishing/compose",
  "/dashboard/publishing/posts",
  "/dashboard/publishing/calendar",
  "/dashboard/publishing/analytics",
] as const;

export type OAuthAuthorizationReturnPath =
  (typeof OAUTH_AUTHORIZATION_RETURN_PATHS)[number];
