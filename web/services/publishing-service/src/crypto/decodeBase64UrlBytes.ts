const BASE64_URL_PATTERN = /^[A-Za-z0-9_-]+$/;

export const decodeBase64UrlBytes = (value: string): Buffer | null => {
  if (!BASE64_URL_PATTERN.test(value)) {
    return null;
  }

  const decoded = Buffer.from(value, "base64url");
  return decoded.toString("base64url") === value ? decoded : null;
};
