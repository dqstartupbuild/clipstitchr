export function getCompletedRunAssetLabel(tool: string, count: number) {
  const isPlural = count !== 1;

  if (tool === "avatar-photo") {
    return isPlural ? "avatar photos" : "avatar photo";
  }

  if (tool === "clipr") {
    return isPlural ? "clips" : "clip";
  }

  if (tool === "stitchr") {
    return isPlural ? "stitches" : "stitch";
  }

  if (tool === "swapr") {
    return isPlural ? "swaps" : "swap";
  }

  if (tool === "swipr") {
    return isPlural ? "swipes" : "swipe";
  }

  return isPlural ? "items" : "item";
}
