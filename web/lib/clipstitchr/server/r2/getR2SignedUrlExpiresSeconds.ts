const DEFAULT_R2_SIGNED_URL_EXPIRES_SECONDS = 900;

export function getR2SignedUrlExpiresSeconds() {
  const value = process.env.R2_SIGNED_URL_EXPIRES_SECONDS;

  if (!value) {
    return DEFAULT_R2_SIGNED_URL_EXPIRES_SECONDS;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return DEFAULT_R2_SIGNED_URL_EXPIRES_SECONDS;
  }

  return parsedValue;
}
