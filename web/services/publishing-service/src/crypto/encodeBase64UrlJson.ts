export const encodeBase64UrlJson = (value: unknown): string =>
  Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
