export function readStudioClipsFontName(input: {
  data: Buffer;
  length: number;
  offset: number;
  platformId: number;
}): string {
  const raw = input.data.subarray(input.offset, input.offset + input.length);
  try {
    return new TextDecoder(
      input.platformId === 0 || input.platformId === 3
        ? "utf-16be"
        : "macintosh",
    )
      .decode(raw)
      .replaceAll("\0", "")
      .trim();
  } catch {
    return "";
  }
}
