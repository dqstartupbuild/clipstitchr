export function getStudioEditorUtf8ByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}
