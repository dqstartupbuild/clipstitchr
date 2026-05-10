const encoder = new TextEncoder();

export function encodeZipString(value: string) {
  return encoder.encode(value);
}
