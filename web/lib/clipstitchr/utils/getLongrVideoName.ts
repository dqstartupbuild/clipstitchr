export function getLongrVideoName() {
  const date = new Date().toISOString().slice(0, 10);

  return `clipstitchr-longr-${date}.mp4`;
}
