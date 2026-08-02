export const readPublishingMediaSha256HexDigest = (
  value: string | undefined,
): string | undefined => {
  const encoded = value?.trim();

  if (encoded === undefined || !/^[A-Za-z0-9+/]{43}=$/u.test(encoded)) {
    return undefined;
  }

  const decoded = Buffer.from(encoded, "base64");

  return decoded.byteLength === 32 ? decoded.toString("hex") : undefined;
};
