const MAX_STUDIO_CLIPS_FONT_BYTES = 10 * 1024 * 1024;

export async function validateStudioClipsFontFile(file: File): Promise<Blob> {
  if (file.size < 12 || file.size > MAX_STUDIO_CLIPS_FONT_BYTES) {
    throw new Error("Choose a TrueType or OpenType font under 10 MB.");
  }

  const signature = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const isTrueType =
    (signature[0] === 0x00 &&
      signature[1] === 0x01 &&
      signature[2] === 0x00 &&
      signature[3] === 0x00) ||
    String.fromCharCode(...signature) === "true";
  const isOpenType = String.fromCharCode(...signature) === "OTTO";

  if (!isTrueType && !isOpenType) {
    throw new Error("That file is not a valid TrueType or OpenType font.");
  }

  return new Blob([file], {
    type: isOpenType ? "font/otf" : "font/ttf",
  });
}
