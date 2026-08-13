export function getStudioReelUtf8ByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}
