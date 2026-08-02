const BASE64_URL_PATTERN = /^[A-Za-z0-9_-]+$/;

export const decodeBase64UrlJson = (value: string): unknown => {
  if (!BASE64_URL_PATTERN.test(value)) {
    throw new TypeError("Invalid base64url JSON.");
  }

  const decoded = Buffer.from(value, "base64url");

  if (decoded.toString("base64url") !== value) {
    throw new TypeError("Non-canonical base64url JSON.");
  }

  return JSON.parse(decoded.toString("utf8")) as unknown;
};
