export function getStudioBetaGlobalEnabled(
  value = process.env.STUDIO_BETA_ENABLED,
) {
  return value === "true";
}
