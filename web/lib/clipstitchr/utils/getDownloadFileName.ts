export function getDownloadFileName(ugcName: string, demoName: string) {
  const date = new Date().toISOString().slice(0, 10);
  const cleanUgcName = ugcName.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]+/gi, "-");
  const cleanDemoName = demoName.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]+/gi, "-");

  return `clipstitchr-${cleanUgcName}-${cleanDemoName}-${date}.mp4`.toLowerCase();
}
