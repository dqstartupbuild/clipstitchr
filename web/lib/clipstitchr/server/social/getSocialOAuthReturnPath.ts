const allowedSocialOAuthReturnPaths = new Set([
  "/dashboard/settings",
  "/dashboard/schedule",
]);

export function getSocialOAuthReturnPath(value: unknown) {
  return typeof value === "string" && allowedSocialOAuthReturnPaths.has(value)
    ? value
    : "/dashboard/settings";
}
