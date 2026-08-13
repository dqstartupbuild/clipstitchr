export function wrapStudioReelOverlayText(
  text: string,
  fontSizePixels: number,
  maxWidthPixels: number,
) {
  const maxCharacters = Math.max(
    4,
    Math.floor(maxWidthPixels / (fontSizePixels * 0.58)),
  );
  const words = text.trim().split(/\s+/u);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > maxCharacters) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.join("\\N");
}
