export const decodeBase64Key = (encodedKey: string): Uint8Array | null => {
  if (
    encodedKey.length === 0 ||
    encodedKey.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      encodedKey,
    )
  ) {
    return null;
  }

  const decoded = Buffer.from(encodedKey, "base64");

  if (decoded.toString("base64") !== encodedKey) {
    return null;
  }

  return new Uint8Array(decoded);
};
