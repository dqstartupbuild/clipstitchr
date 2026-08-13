export function getStudioBetaOperatorSecret() {
  const secret = process.env.STUDIO_BETA_OPERATOR_SECRET;

  if (!secret) {
    throw new Error("Missing STUDIO_BETA_OPERATOR_SECRET.");
  }

  return secret;
}
