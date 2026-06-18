export function getCompletedRunToolLabel(tool: string) {
  if (tool === "avatar-photo") {
    return "Avatar photo";
  }

  if (tool === "clipr") {
    return "Clipr";
  }

  if (tool === "stitchr") {
    return "Stitchr";
  }

  if (tool === "swapr") {
    return "Swapr";
  }

  if (tool === "swipr") {
    return "Swipr";
  }

  return "Automation";
}
