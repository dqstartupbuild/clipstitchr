export function getIndexNowSubmitSecret() {
  const secret = process.env.INDEXNOW_SUBMIT_SECRET;

  if (!secret) {
    throw new Error("Missing INDEXNOW_SUBMIT_SECRET.");
  }

  return secret;
}
