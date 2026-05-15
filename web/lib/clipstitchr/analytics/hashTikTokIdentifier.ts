function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashTikTokIdentifier(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  if (!normalizedValue || typeof crypto === "undefined" || !crypto.subtle) {
    return null;
  }

  const encodedValue = new TextEncoder().encode(normalizedValue);
  const digest = await crypto.subtle.digest("SHA-256", encodedValue);

  return bufferToHex(digest);
}
