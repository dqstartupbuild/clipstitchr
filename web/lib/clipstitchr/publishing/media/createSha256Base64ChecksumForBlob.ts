export async function createSha256Base64ChecksumForBlob(blob: Blob) {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()),
  );
  const binaryDigest = Array.from(digest, (byte) =>
    String.fromCharCode(byte),
  ).join("");

  return btoa(binaryDigest);
}
