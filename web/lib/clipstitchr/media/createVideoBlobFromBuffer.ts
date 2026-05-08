export function createVideoBlobFromBuffer(
  buffer: ArrayBuffer | null,
  mimeType: string,
) {
  if (!buffer) {
    throw new Error("Media Bunny did not produce an output buffer.");
  }

  return new Blob([buffer], { type: mimeType });
}
