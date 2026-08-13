export function getStudioLazyReelUtf8ByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}
