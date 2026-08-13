export const OAUTH_AUTHORIZATION_RETURN_PATHS = [
  "/dashboard/studio/publishing",
  "/dashboard/studio/publishing/integrations",
  "/dashboard/studio/publishing/compose",
  "/dashboard/studio/publishing/posts",
  "/dashboard/studio/publishing/calendar",
  "/dashboard/studio/publishing/analytics",
] as const;

export type OAuthAuthorizationReturnPath =
  (typeof OAUTH_AUTHORIZATION_RETURN_PATHS)[number];
