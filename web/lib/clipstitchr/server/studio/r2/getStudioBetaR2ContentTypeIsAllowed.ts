import type { StudioBetaR2ObjectKind } from "@/lib/clipstitchr/types/StudioBetaR2ObjectKind";

const allowedExactTypes: Record<StudioBetaR2ObjectKind, Set<string>> = {
  caption: new Set(["text/plain", "text/vtt", "application/x-subrip"]),
  font: new Set([
    "font/otf",
    "font/sfnt",
    "font/ttf",
    "application/font-sfnt",
    "application/x-font-opentype",
    "application/x-font-truetype",
  ]),
  "media-output": new Set(),
  "media-source": new Set(),
  poster: new Set(["image/jpeg", "image/png", "image/webp"]),
  project: new Set(["application/json"]),
  "research-artifact": new Set(["application/json", "text/plain"]),
};

export function getStudioBetaR2ContentTypeIsAllowed(
  kind: StudioBetaR2ObjectKind,
  contentType: string,
) {
  const normalizedContentType = contentType.toLowerCase().split(";", 1)[0];

  if (allowedExactTypes[kind].has(normalizedContentType)) {
    return true;
  }

  if (kind !== "media-source" && kind !== "media-output") {
    return false;
  }

  return (
    normalizedContentType.startsWith("video/") ||
    normalizedContentType.startsWith("audio/") ||
    ["image/jpeg", "image/png", "image/webp"].includes(normalizedContentType)
  );
}
