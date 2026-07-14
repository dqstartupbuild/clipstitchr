export function getEmailConfirmationTokenSecret() {
  const secret = process.env.EMAIL_CONFIRMATION_TOKEN_SECRET?.trim();

  if (!secret) {
    throw new Error("Email confirmation is not configured.");
  }

  return secret;
}
