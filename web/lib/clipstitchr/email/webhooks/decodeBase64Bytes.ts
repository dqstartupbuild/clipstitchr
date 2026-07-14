export function decodeBase64Bytes(value: string) {
  const decoded = atob(value);

  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}
