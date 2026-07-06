import type { ClipType } from "@/lib/clipstitchr/types/ClipType";

const WIDE_DEMO_ASPECT_RATIO = 1.2;

type GetClipShouldUseUploadBackgroundLayoutOptions = {
  clipType: ClipType;
  sourceAspectRatio: number;
};

export function getClipShouldUseUploadBackgroundLayout({
  clipType,
  sourceAspectRatio,
}: GetClipShouldUseUploadBackgroundLayoutOptions) {
  return (
    clipType === "demo" &&
    Number.isFinite(sourceAspectRatio) &&
    sourceAspectRatio >= WIDE_DEMO_ASPECT_RATIO
  );
}
