export function getStandaloneStitchFileName(clipName: string) {
  const date = new Date().toISOString().slice(0, 10);
  const cleanClipName = clipName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/gi, "-");

  return `clipstitchr-${cleanClipName}-${date}.mp4`.toLowerCase();
}
